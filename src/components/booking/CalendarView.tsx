import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, Loader2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { RoomType } from '../../pages/Booking';
import { getBookedDates, checkDateRangeAvailability } from '../../services/bookingService';

interface CalendarViewProps {
  roomType: RoomType;
  onSelectDate: (checkInDate: Date, checkOutDate: Date) => void;
  onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ roomType, onSelectDate, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const roomNames = {
    deluxe: 'Deluxe Room',
    regular: 'Standard Room',
    suite: 'Twin Bed Suite',
  };

  useEffect(() => {
    const fetchBookedDates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dates = await getBookedDates(roomType);
        setBookedDates(dates);
      } catch (err) {
        console.error('Error loading booked dates:', err);
        setError('Failed to load availability. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookedDates();
  }, [roomType]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isDateBooked = (date: Date) => {
    return bookedDates.some((bookedDate) => {
      return (
        bookedDate.getDate() === date.getDate() &&
        bookedDate.getMonth() === date.getMonth() &&
        bookedDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSameDate = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isDateInRange = (date: Date) => {
    if (!checkInDate || !checkOutDate) return false;
    return date > checkInDate && date < checkOutDate;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = async (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (isDateBooked(clickedDate) || isDatePast(clickedDate)) {
      return;
    }

    setConflictError(null);

    if (!checkInDate) {
      setCheckInDate(clickedDate);
      setCheckOutDate(null);
    } else if (!checkOutDate) {
      if (clickedDate < checkInDate) {
        setCheckInDate(clickedDate);
        setCheckOutDate(null);
      } else {
        const result = await checkDateRangeAvailability(roomType, checkInDate, clickedDate);
        
        if (result.available) {
          setCheckOutDate(clickedDate);
        } else {
          const conflictDatesStr = result.conflictDates
            .map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
            .join(', ');
          
          setConflictError(
            `All rooms are fully booked on: ${conflictDatesStr}. Please select a different range.`
          );
          setCheckInDate(null);
          setCheckOutDate(null);
        }
      }
    } else {
      setCheckInDate(clickedDate);
      setCheckOutDate(null);
    }
  };

  const handleContinue = () => {
    if (checkInDate && checkOutDate) {
      onSelectDate(checkInDate, checkOutDate);
    }
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const nights = calculateNights();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full border border-gray-100"
        style={{
          background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1B4B9E] hover:text-[#D42B2B] transition-all duration-300 mb-8 group"
        >
          <motion.div
            whileHover={{ x: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <ArrowLeft size={20} />
          </motion.div>
          <span className="font-semibold">Back to Rooms</span>
        </button>

        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1B4B9E] to-[#2563B8] rounded-2xl mb-4 shadow-lg"
          >
            <CalendarIcon className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] bg-clip-text text-transparent mb-3">
            Select Your Dates
          </h2>
          <div className="booking-room-badge inline-block px-6 py-2 bg-gradient-to-r from-[#1B4B9E]/10 to-[#2563B8]/10 rounded-full border border-[#1B4B9E]/20">
            <p className="text-[#1B4B9E] font-semibold">{roomNames[roomType]}</p>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {!checkInDate && '✨ Select your check-in date'}
            {checkInDate && !checkOutDate && '✨ Select your check-out date'}
            {checkInDate && checkOutDate && (
              <span className="text-[#D42B2B] font-semibold">
                🌟 {nights} night{nights !== 1 ? 's' : ''} selected
              </span>
            )}
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Loader2 className="h-12 w-12 text-[#1B4B9E] mb-4" />
            </motion.div>
            <p className="text-gray-600 font-medium">Loading availability...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-red-600 hover:text-red-800 underline font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        <AnimatePresence>
          {conflictError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-3 shadow-lg"
            >
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">{conflictError}</p>
              </div>
              <button
                onClick={() => setConflictError(null)}
                className="text-red-600 hover:text-red-800 font-bold text-xl"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && !error && (
          <>
            <div className="bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] rounded-2xl p-6 mb-8 shadow-xl">
              <div className="flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevMonth}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all backdrop-blur-sm"
                >
                  <ChevronLeft size={24} strokeWidth={3} />
                </motion.button>

                <h3 className="booking-calendar-month text-2xl font-serif font-bold text-white">{monthName}</h3>

                <motion.button
                  whileHover={{ scale: 1.1, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextMonth}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all backdrop-blur-sm"
                >
                  <ChevronRight size={24} strokeWidth={3} />
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-bold text-[#1B4B9E] py-3">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3 mb-8">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} />;
                }

                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const isBooked = isDateBooked(date);
                const isPast = isDatePast(date);
                const isCheckIn = isSameDate(checkInDate, date);
                const isCheckOut = isSameDate(checkOutDate, date);
                const isInRange = isDateInRange(date);
                const isDisabled = isBooked || isPast;

                return (
                  <motion.button
                    key={day}
                    whileHover={!isDisabled ? { scale: 1.08, y: -2 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={`
                      relative aspect-square rounded-2xl flex flex-col items-center justify-center text-base font-bold
                      transition-all duration-300 ease-out shadow-md
                      ${isCheckIn || isCheckOut
                        ? 'bg-gradient-to-br from-[#1B4B9E] to-[#2563B8] text-white shadow-xl scale-105 ring-4 ring-[#1B4B9E]/30'
                        : isInRange
                        ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-[#1B4B9E] border-2 border-blue-200'
                        : isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-lg border-2 border-gray-200 hover:border-[#1B4B9E]/30'
                      }
                    `}
                  >
                    <span className={isDisabled ? 'line-through' : ''}>{day}</span>
                    {(isCheckIn || isCheckOut) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-[#D42B2B] rounded-full border-2 border-white"
                      />
                    )}
                    {isBooked && !isPast && (
                      <span className="absolute bottom-1 text-[10px] text-gray-500 font-normal">Full</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex justify-center gap-8 mb-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-lg shadow-sm" />
                <span className="text-sm text-gray-700 font-medium">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-100 rounded-lg opacity-60 shadow-sm" />
                <span className="text-sm text-gray-700 font-medium">Fully Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-[#1B4B9E] to-[#2563B8] rounded-lg shadow-md" />
                <span className="text-sm text-gray-700 font-medium">Selected</span>
              </div>
            </div>

            <motion.button
              whileHover={checkInDate && checkOutDate ? { scale: 1.02, y: -2 } : {}}
              whileTap={checkInDate && checkOutDate ? { scale: 0.98 } : {}}
              onClick={handleContinue}
              disabled={!checkInDate || !checkOutDate}
              className={`
                w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl
                ${checkInDate && checkOutDate
                  ? 'bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] text-white hover:shadow-2xl hover:from-[#D42B2B] hover:to-[#B91C1C] cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {checkInDate && checkOutDate
                ? `Continue with ${nights} night${nights !== 1 ? 's' : ''} • ${checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'Select check-in and check-out dates'}
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CalendarView;
