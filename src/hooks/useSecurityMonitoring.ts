import { useEffect, useRef } from 'react';

interface SecurityEvent {
  type: 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'xss_attempt';
  timestamp: Date;
  details: any;
  userAgent?: string;
  ip?: string;
}

export const useSecurityMonitoring = () => {
  const securityEvents = useRef<SecurityEvent[]>([]);
  const rateLimitMap = useRef<Map<string, number[]>>(new Map());

  // Log security events
  const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp' | 'userAgent'>) => {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      userAgent: navigator.userAgent
    };

    securityEvents.current.push(securityEvent);
    
    // Keep only last 100 events to prevent memory issues
    if (securityEvents.current.length > 100) {
      securityEvents.current = securityEvents.current.slice(-100);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('Security Event:', securityEvent);
    }

    // In production, you might want to send this to a monitoring service
    if (import.meta.env.PROD) {
      // Example: Send to monitoring service
      // sendToMonitoringService(securityEvent);
    }
  };

  // Rate limiting function
  const checkRateLimit = (identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
    const now = Date.now();
    const attempts = rateLimitMap.current.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      logSecurityEvent({
        type: 'rate_limit_exceeded',
        details: { identifier, attempts: recentAttempts.length, maxAttempts }
      });
      return false;
    }
    
    recentAttempts.push(now);
    rateLimitMap.current.set(identifier, recentAttempts);
    return true;
  };

  // Detect potential XSS attempts
  const detectXSSAttempt = (input: string): boolean => {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    const hasXSS = xssPatterns.some(pattern => pattern.test(input));
    
    if (hasXSS) {
      logSecurityEvent({
        type: 'xss_attempt',
        details: { input: input.substring(0, 100) } // Log only first 100 chars
      });
    }
    
    return hasXSS;
  };

  // Monitor for suspicious activity
  useEffect(() => {
    // Monitor for rapid form submissions
    let formSubmissionCount = 0;
    const resetFormCount = () => { formSubmissionCount = 0; };
    const formSubmissionTimer = setInterval(resetFormCount, 60000); // Reset every minute

    const handleFormSubmit = () => {
      formSubmissionCount++;
      if (formSubmissionCount > 10) { // More than 10 submissions per minute
        logSecurityEvent({
          type: 'suspicious_activity',
          details: { activity: 'rapid_form_submissions', count: formSubmissionCount }
        });
      }
    };

    // Monitor for console access (potential developer tools usage)
    const originalConsole = console.log;
    console.log = (...args) => {
      if (import.meta.env.PROD) {
        logSecurityEvent({
          type: 'suspicious_activity',
          details: { activity: 'console_access', args: args.slice(0, 2) }
        });
      }
      originalConsole.apply(console, args);
    };

    // Add event listeners
    document.addEventListener('submit', handleFormSubmit);

    return () => {
      clearInterval(formSubmissionTimer);
      document.removeEventListener('submit', handleFormSubmit);
      console.log = originalConsole;
    };
  }, []);

  return {
    logSecurityEvent,
    checkRateLimit,
    detectXSSAttempt,
    getSecurityEvents: () => securityEvents.current
  };
};