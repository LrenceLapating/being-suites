import { useEffect } from 'react';

// Security headers component to add client-side security measures
const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Add security-related meta tags if they don't exist
    const addMetaTag = (name: string, content: string) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Content Security Policy (basic client-side enforcement)
    addMetaTag('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://kdluvyhsnohagnumkbwd.supabase.co; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://kdluvyhsnohagnumkbwd.supabase.co wss://kdluvyhsnohagnumkbwd.supabase.co; " +
      "font-src 'self'; " +
      "object-src 'none'; " +
      "base-uri 'self';"
    );

    // Prevent MIME type sniffing
    addMetaTag('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    addMetaTag('X-Frame-Options', 'DENY');

    // XSS Protection
    addMetaTag('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    addMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    addMetaTag('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
    );

    // Disable autocomplete for sensitive forms
    const sensitiveInputs = document.querySelectorAll('input[type="password"], input[name*="admin"]');
    sensitiveInputs.forEach(input => {
      (input as HTMLInputElement).setAttribute('autocomplete', 'off');
    });

    // Prevent right-click context menu in production (optional)
    if (import.meta.env.PROD) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  return null; // This component doesn't render anything
};

export default SecurityHeaders;