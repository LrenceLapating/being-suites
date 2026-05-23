import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { BookingData } from '../../pages/Booking';
import { createBooking } from '../../services/bookingService';

interface BookingFormProps {
  bookingData: BookingData;
  onBack: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ bookingData, onBack }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomNames = {
    deluxe: 'Deluxe Room',
    regular: 'Standard Room',
    suite: 'Twin Bed Suite',
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateNights = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    const diffTime = bookingData.checkOutDate.getTime() - bookingData.checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const checkInDateString = formatDate(bookingData.checkInDate!);
      const checkOutDateString = formatDate(bookingData.checkOutDate!);

      await createBooking({
        room_type: bookingData.roomType!,
        check_in_date: checkInDateString,
        check_out_date: checkOutDateString,
        full_name: formData.fullName,
        contact_number: formData.contactNumber,
        email: formData.email,
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(
        err.message || 'Failed to create booking. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.fullName && formData.contactNumber && formData.email;
  const nights = calculateNights();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full z-10"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1B4B9E] hover:text-[#D42B2B] transition-colors duration-300 mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Calendar</span>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-[#1B4B9E] mb-2">
            Complete Your Booking
          </h2>
          <p className="text-gray-600">Just a few more details</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1B4B9E] to-[#2563B8] text-white rounded-2xl p-6 mb-8 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-3">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="opacity-90">Room Type:</span>
              <span className="font-semibold">{roomNames[bookingData.roomType!]}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Check-in:</span>
              <span className="font-semibold">
                {bookingData.checkInDate?.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-90">Check-out:</span>
              <span className="font-semibold">
                {bookingData.checkOutDate?.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/20">
              <span className="opacity-90">Total Nights:</span>
              <span className="font-semibold">{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1B4B9E] focus:ring-2 focus:ring-[#1B4B9E]/20 outline-none transition-all duration-300"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="contactNumber" className="block text-sm font-semibold text-gray-900 mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1B4B9E] focus:ring-2 focus:ring-[#1B4B9E]/20 outline-none transition-all duration-300"
              placeholder="+63 912 345 6789"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#1B4B9E] focus:ring-2 focus:ring-[#1B4B9E]/20 outline-none transition-all duration-300"
              placeholder="john.doe@example.com"
            />
          </div>

          <motion.button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            whileHover={isFormValid && !isSubmitting ? { scale: 1.02 } : {}}
            whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
            className={`
              w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 ease-in-out relative overflow-hidden
              ${isFormValid && !isSubmitting
                ? 'bg-[#1B4B9E] text-white hover:bg-[#D42B2B] hover:shadow-xl cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.span
                  key="submitting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Processing...
                </motion.span>
              ) : (
                <motion.span
                  key="submit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Confirm Booking
                </motion.span>
              )}
            </AnimatePresence>

            {isFormValid && !isSubmitting && (
              <motion.div
                className="absolute inset-0 bg-[#D42B2B] opacity-0 hover:opacity-20 transition-opacity duration-300"
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(212, 43, 43, 0)',
                    '0 0 20px rgba(212, 43, 43, 0.3)',
                    '0 0 0px rgba(212, 43, 43, 0)',
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </motion.button>
        </form>
      </motion.div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="bg-white rounded-3xl p-12 text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-[#1B4B9E] rounded-full flex items-center justify-center mx-auto mb-6 relative"
              >
                <Check size={48} className="text-white" strokeWidth={3} />
                
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 border-4 border-[#1B4B9E] rounded-full"
                />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-serif text-[#1B4B9E] mb-2"
              >
                Booking Confirmed!
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600"
              >
                We've sent a confirmation to your email
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingForm;
