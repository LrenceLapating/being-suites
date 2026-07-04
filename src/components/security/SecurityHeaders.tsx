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
      "script-src 'self' 'unsafe-inline' https://*.supabase.co https://secured.sirvoy.com https://*.sirvoy.com; " +
      "script-src-elem 'self' 'unsafe-inline' https://secured.sirvoy.com https://*.sirvoy.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://secured.sirvoy.com https://*.sirvoy.com; " +
      "font-src 'self' data: https: https://fonts.gstatic.com; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://secured.sirvoy.com https://*.sirvoy.com; " +
      "frame-src 'self' https://www.google.com https://maps.google.com https://secured.sirvoy.com https://*.sirvoy.com; " +
      "child-src 'self' https://secured.sirvoy.com https://*.sirvoy.com; " +
      "form-action 'self' https://secured.sirvoy.com https://*.sirvoy.com; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "frame-ancestors 'none';"
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
