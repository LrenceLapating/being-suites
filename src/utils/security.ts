// Security utilities for input validation and sanitization

export class SecurityUtils {
  
  // Email validation with security considerations
  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Basic format check
    if (!emailRegex.test(email)) return false;
    
    // Length check (prevent buffer overflow)
    if (email.length > 254) return false;
    
    // Prevent common injection patterns
    const dangerousPatterns = [
      '<script', 'javascript:', 'data:', 'vbscript:', 'onload=', 'onerror='
    ];
    
    const lowerEmail = email.toLowerCase();
    return !dangerousPatterns.some(pattern => lowerEmail.includes(pattern));
  }

  // Phone number validation
  static validatePhoneNumber(phone: string): boolean {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check length (7-15 digits is standard international range)
    if (cleanPhone.length < 7 || cleanPhone.length > 15) return false;
    
    // Prevent injection patterns
    const originalLength = phone.length;
    const sanitized = phone.replace(/[^0-9+\-\s\(\)]/g, '');
    
    return sanitized.length === originalLength;
  }

  // Name validation (prevent XSS and injection)
  static validateName(name: string): boolean {
    // Length check
    if (name.length < 1 || name.length > 100) return false;
    
    // Allow only letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(name)) return false;
    
    // Prevent script injection
    const dangerousPatterns = [
      '<', '>', 'script', 'javascript', 'onload', 'onerror', 'alert'
    ];
    
    const lowerName = name.toLowerCase();
    return !dangerousPatterns.some(pattern => lowerName.includes(pattern));
  }

  // Sanitize text input (remove potential XSS)
  static sanitizeText(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Password strength validation
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    // Common password check
    const commonPasswords = [
      'password', '123456', 'admin', 'admin123', 'password123',
      'qwerty', 'letmein', 'welcome', 'monkey', 'dragon'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      feedback.push('Avoid common passwords');
      score = Math.max(0, score - 2);
    }

    return {
      isValid: score >= 4 && feedback.length === 0,
      score,
      feedback
    };
  }

  // Rate limiting helper (client-side)
  static createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts = new Map<string, number[]>();

    return (identifier: string): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(identifier) || [];
      
      // Remove old attempts outside the window
      const recentAttempts = userAttempts.filter(time => now - time < windowMs);
      
      if (recentAttempts.length >= maxAttempts) {
        return false; // Rate limit exceeded
      }
      
      recentAttempts.push(now);
      attempts.set(identifier, recentAttempts);
      return true;
    };
  }

  // Generate secure random string
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
}

// Input validation schemas
export const ValidationSchemas = {
  booking: {
    fullName: (value: string) => SecurityUtils.validateName(value),
    email: (value: string) => SecurityUtils.validateEmail(value),
    contactNumber: (value: string) => SecurityUtils.validatePhoneNumber(value),
    roomType: (value: string) => ['regular', 'deluxe', 'suite'].includes(value),
    checkInDate: (value: string) => {
      const date = new Date(value);
      return date instanceof Date && !isNaN(date.getTime()) && date >= new Date();
    },
    checkOutDate: (value: string, checkInDate: string) => {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(value);
      return checkOut instanceof Date && !isNaN(checkOut.getTime()) && checkOut > checkIn;
    }
  }
};