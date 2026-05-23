import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Phone, Mail, MapPin, AlertCircle, Shield } from 'lucide-react';
import { SecurityUtils, ValidationSchemas } from '../../utils/security';
import { useSecurityMonitoring } from '../../hooks/useSecurityMonitoring';

interface SecureBookingFormProps {
  onSubmit: (formData: any) => Promise<void>;
  isSubmitting: boolean;
}

const SecureBookingForm: React.FC<SecureBookingFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    roomType: 'regular' as 'regular' | 'deluxe' | 'suite',
    checkInDate: '',
    checkOutDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const { checkRateLimit, detectXSSAttempt, logSecurityEvent } = useSecurityMonitoring();

  // Validate form data
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Validate each field
    if (formData.fullName && !ValidationSchemas.booking.fullName(formData.fullName)) {
      newErrors.fullName = 'Please enter a valid name (letters, spaces, hyphens only)';
    }

    if (formData.email && !ValidationSchemas.booking.email(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.contactNumber && !ValidationSchemas.booking.contactNumber(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid phone number';
    }

    if (formData.checkInDate && !ValidationSchemas.booking.checkInDate(formData.checkInDate)) {
      newErrors.checkInDate = 'Check-in date must be today or later';
    }

    if (formData.checkOutDate && formData.checkInDate && 
        !ValidationSchemas.booking.checkOutDate(formData.checkOutDate, formData.checkInDate)) {
      newErrors.checkOutDate = 'Check-out date must be after check-in date';
    }

    setErrors(newErrors);
    
    // Form is valid if all required fields are filled and no errors
    const requiredFields = ['fullName', 'email', 'contactNumber', 'checkInDate', 'checkOutDate'];
    const allFieldsFilled = requiredFields.every(field => formData[field as keyof typeof formData]);
    setIsFormValid(allFieldsFilled && Object.keys(newErrors).length === 0);
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    // Check for XSS attempts
    if (detectXSSAttempt(value)) {
      logSecurityEvent({
        type: 'xss_attempt',
        details: { field, value: value.substring(0, 50) }
      });
      return; // Don't update the field if XSS detected
    }

    // Sanitize input
    const sanitizedValue = SecurityUtils.sanitizeText(value);
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check
    const clientId = `booking_${formData.email || 'anonymous'}`;
    if (!checkRateLimit(clientId, 3, 10 * 60 * 1000)) { // 3 attempts per 10 minutes
      setErrors({ submit: 'Too many booking attempts. Please wait 10 minutes before trying again.' });
      return;
    }

    if (!isFormValid) {
      setErrors({ submit: 'Please fix all errors before submitting.' });
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      logSecurityEvent({
        type: 'failed_login',
        details: { error: error.message, formData: { ...formData, contactNumber: '***' } }
      });
      setErrors({ submit: error.message || 'Booking failed. Please try again.' });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      {/* Security Notice */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Secure Booking</p>
            <p>Your information is protected with enterprise-grade security measures.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
              maxLength={100}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                errors.fullName ? 'border-red-500 focus:border-red-600' : 
                formData.fullName && !errors.fullName ? 'border-green-500 focus:border-green-600' :
                'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              maxLength={254}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                errors.email ? 'border-red-500 focus:border-red-600' : 
                formData.email && !errors.email ? 'border-green-500 focus:border-green-600' :
                'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="your.email@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Contact Number */}
        <div>
          <label htmlFor="contactNumber" className="block text-sm font-semibold text-gray-900 mb-2">
            Contact Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              required
              maxLength={20}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                errors.contactNumber ? 'border-red-500 focus:border-red-600' : 
                formData.contactNumber && !errors.contactNumber ? 'border-green-500 focus:border-green-600' :
                'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="+63 912 345 6789"
            />
          </div>
          {errors.contactNumber && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.contactNumber}
            </p>
          )}
        </div>

        {/* Room Type */}
        <div>
          <label htmlFor="roomType" className="block text-sm font-semibold text-gray-900 mb-2">
            Room Type *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              id="roomType"
              value={formData.roomType}
              onChange={(e) => handleInputChange('roomType', e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-all duration-300"
            >
              <option value="regular">Standard Room</option>
              <option value="deluxe">Deluxe Room</option>
              <option value="suite">Twin Bed Suite</option>
            </select>
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkInDate" className="block text-sm font-semibold text-gray-900 mb-2">
              Check-in Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                id="checkInDate"
                value={formData.checkInDate}
                onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                  errors.checkInDate ? 'border-red-500 focus:border-red-600' : 
                  'border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.checkInDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.checkInDate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="checkOutDate" className="block text-sm font-semibold text-gray-900 mb-2">
              Check-out Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                id="checkOutDate"
                value={formData.checkOutDate}
                onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                required
                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg outline-none transition-all duration-300 ${
                  errors.checkOutDate ? 'border-red-500 focus:border-red-600' : 
                  'border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.checkOutDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.checkOutDate}
              </p>
            )}
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {errors.submit}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          whileHover={isFormValid && !isSubmitting ? { scale: 1.02 } : {}}
          whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
          className={`
            w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 relative overflow-hidden
            ${isFormValid && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Processing Secure Booking...
            </span>
          ) : (
            'Book Now - Secure & Protected'
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default SecureBookingForm;