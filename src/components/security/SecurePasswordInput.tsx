import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { SecurityUtils } from '../../utils/security';

interface SecurePasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showStrengthMeter?: boolean;
  className?: string;
}

const SecurePasswordInput: React.FC<SecurePasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Enter secure password",
  required = false,
  showStrengthMeter = true,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<{ isValid: boolean; score: number; feedback: string[] }>({
    isValid: false,
    score: 0,
    feedback: [],
  });

  useEffect(() => {
    if (value) {
      const validation = SecurityUtils.validatePasswordStrength(value);
      setStrength(validation);
    } else {
      setStrength({ isValid: false, score: 0, feedback: [] });
    }
  }, [value]);

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Shield className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-12 py-3 border-2 rounded-lg outline-none transition-all duration-300
            ${strength.isValid && value ? 'border-green-500 focus:border-green-600' : 
              value && !strength.isValid ? 'border-red-500 focus:border-red-600' : 
              'border-gray-200 focus:border-blue-500'}
            ${className}
          `}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {showStrengthMeter && value && (
        <div className="space-y-2">
          {/* Strength meter */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
                style={{ width: `${(strength.score / 6) * 100}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${
              strength.score <= 2 ? 'text-red-600' :
              strength.score <= 4 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {getStrengthText(strength.score)}
            </span>
          </div>

          {/* Feedback */}
          {strength.feedback.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {strength.feedback.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {strength.isValid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  Password meets security requirements
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecurePasswordInput;
