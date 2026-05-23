import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const EnvCheck: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const checks = [
    {
      name: 'VITE_SUPABASE_URL',
      value: supabaseUrl,
      isValid: supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co'),
      displayValue: supabaseUrl || 'NOT SET'
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      value: supabaseKey,
      isValid: supabaseKey && supabaseKey.length > 100,
      displayValue: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET'
    }
  ];

  const allValid = checks.every(check => check.isValid);
  const hasErrors = checks.some(check => !check.isValid);

  // Only show when there are actual configuration errors
  if (allValid) {
    return null;
  }

  // In production, only show critical errors, not the security note
  if (import.meta.env.PROD && !hasErrors) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white border-2 border-red-200 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <h3 className="font-semibold text-gray-800">Configuration Error</h3>
      </div>
      
      <div className="space-y-2">
        {checks.filter(check => !check.isValid).map((check) => (
          <div key={check.name} className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="font-mono text-xs">{check.name}:</span>
            <span className="text-red-700">{check.displayValue}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
        <strong>Action Required:</strong> Environment variables are missing or invalid. Please check your configuration.
      </div>
    </div>
  );
};

export default EnvCheck;