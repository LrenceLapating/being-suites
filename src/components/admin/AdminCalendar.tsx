import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { Booking } from '../../lib/supabase';
import { getAllRoomBlocks, RoomAvailabilityAdjustment, cleanupExpiredRoomBlocks } from '../../services/roomAvailabilityService';

interface AdminCalendarProps {
  bookings: Booking[];
  onDateClick: (date: Date, bookings: Booking[], blocks: RoomAvailabilityAdjustment[]) => void;
}

const AdminCalendar: React.FC<AdminCalendarProps> = ({ bookings, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [roomBlocks, setRoomBlocks] = useState<RoomAvailabilityAdjustment[]>([]);

  React.useEffect(() => {
    const loadRoomBlocks = async () => {
      try {
        // First, clean up any expired blocks
        await cleanupExpiredRoomBlocks();
        
        // Then load current and future blocks
        const blocks = await getAllRoomBlocks();
        setRoomBlocks(blocks);
      } catch (error) {
        console.error('Error loading room blocks:', error);
      }
    };
    
    loadRoomBlocks();
    
    // Auto-refresh room blocks every 30 seconds (same interval as bookings)
    const interval = setInterval(loadRoomBlocks, 30000);
    return () => clearInterval(interval);
  }, []);

  const roomColors = {
    deluxe: {
      bg: 'from-[#1B4B9E] to-[#2563B8]',
      dot: '#1B4B9E',
      light: 'bg-blue-50',
      border: 'border-blue-200',
    },
    regular: {
      bg: 'from-emerald-500 to-emerald-600',
      dot: '#10B981',
      light: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    suite: {
      bg: 'from-purple-500 to-purple-600',
      dot: '#8B5CF6',
      light: 'bg-purple-50',
      border: 'border-purple-200',
    },
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getBookingsForDate = (date: Date): Booking[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings.filter((booking) => {
      const [checkInYear, checkInMonth, checkInDay] = booking.check_in_date.split('-').map(Number);
      const [checkOutYear, checkOutMonth, checkOutDay] = booking.check_out_date.split('-').map(Number);
      
      const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay);
      const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);
      
      // Filter out bookings where check-out date is before today
      return (
        date >= checkInDate &&
        date <= checkOutDate &&
        booking.status === 'confirmed' &&
        checkOutDate >= today
      );
    });
  };

  const getBlocksForDate = (date: Date): RoomAvailabilityAdjustment[] => {
    // Format date as YYYY-MM-DD in local timezone (not UTC)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return roomBlocks.filter((block) => {
      return dateStr >= block.check_in_date && dateStr <= block.check_out_date;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateBookings = getBookingsForDate(clickedDate);
    const dateBlocks = getBlocksForDate(clickedDate);
    
    if (dateBookings.length > 0 || dateBlocks.length > 0) {
      onDateClick(clickedDate, dateBookings, dateBlocks);
    }
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-14 h-14 bg-gradient-to-br from-[#1B4B9E] to-[#2563B8] rounded-2xl flex items-center justify-center shadow-lg"
          >
            <CalendarIcon className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-serif font-bold bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] bg-clip-text text-transparent">
              {monthName}
            </h2>
            <p className="text-sm text-gray-500 font-medium">Booking Calendar</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevMonth}
            className="p-3 bg-gradient-to-br from-gray-100 to-gray-50 hover:from-[#1B4B9E] hover:to-[#2563B8] text-gray-700 hover:text-white rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentDate(new Date())}
            className="px-5 py-2.5 text-sm font-bold text-[#1B4B9E] hover:text-white bg-gradient-to-r from-blue-50 to-blue-100 hover:from-[#1B4B9E] hover:to-[#2563B8] rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Today
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextMonth}
            className="p-3 bg-gradient-to-br from-gray-100 to-gray-50 hover:from-[#1B4B9E] hover:to-[#2563B8] text-gray-700 hover:text-white rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <ChevronRight size={24} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 via-emerald-50 to-purple-50 rounded-2xl p-5 mb-8 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-[#1B4B9E]" />
          <span className="text-sm text-gray-700 font-bold">Room Types</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#1B4B9E] to-[#2563B8] shadow-md" />
            <span className="text-sm text-gray-700 font-semibold">Deluxe</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-emerald-100">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md" />
            <span className="text-sm text-gray-700 font-semibold">Standard</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-purple-100">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-md" />
            <span className="text-sm text-gray-700 font-semibold">Suite</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-bold text-[#1B4B9E] py-3 bg-gradient-to-b from-blue-50 to-transparent rounded-xl">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dateBookings = getBookingsForDate(date);
          const dateBlocks = getBlocksForDate(date);
          const hasBookings = dateBookings.length > 0;
          const hasBlocks = dateBlocks.length > 0;
          const hasActivity = hasBookings || hasBlocks;
          const isToday = date.getTime() === today.getTime();
          const isPast = date < today;

          const roomTypeCounts = {
            deluxe: dateBookings.filter(b => b.room_type === 'deluxe').length,
            regular: dateBookings.filter(b => b.room_type === 'regular').length,
            suite: dateBookings.filter(b => b.room_type === 'suite').length,
          };

          const blockCounts = {
            deluxe: dateBlocks.filter(b => b.room_type === 'deluxe').reduce((sum, b) => sum + b.adjustment_count, 0),
            regular: dateBlocks.filter(b => b.room_type === 'regular').reduce((sum, b) => sum + b.adjustment_count, 0),
            suite: dateBlocks.filter(b => b.room_type === 'suite').reduce((sum, b) => sum + b.adjustment_count, 0),
          };

          const totalActivity = dateBookings.length + dateBlocks.length;

          return (
            <motion.div
              key={day}
              whileHover={hasActivity ? { scale: 1.05, y: -4 } : {}}
              whileTap={hasActivity ? { scale: 0.98 } : {}}
              onClick={() => handleDateClick(day)}
              className={`
                relative min-h-[120px] rounded-2xl p-4 transition-all duration-300 shadow-md
                ${hasActivity ? 'cursor-pointer hover:shadow-2xl' : ''}
                ${isToday ? 'ring-4 ring-[#D42B2B] ring-offset-2' : ''}
                ${isPast ? 'bg-gradient-to-br from-gray-50 to-gray-100' : 'bg-white'}
                ${hasActivity ? 'border-2 border-[#1B4B9E] bg-gradient-to-br from-blue-50/50 to-white' : 'border-2 border-gray-200'}
              `}
            >
              <div className={`
                text-base font-bold mb-3 flex items-center justify-between
                ${isToday ? 'text-[#D42B2B]' : isPast ? 'text-gray-400' : 'text-gray-800'}
              `}>
                <span>{day}</span>
                {isToday && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-2 h-2 bg-[#D42B2B] rounded-full"
                  />
                )}
              </div>

              {hasActivity && (
                <div className="space-y-2">
                  {/* Show bookings */}
                  {Object.entries(roomTypeCounts).map(([roomType, count]) => {
                    if (count === 0) return null;
                    const colors = roomColors[roomType as keyof typeof roomColors];
                    
                    return (
                      <motion.div
                        key={`booking-${roomType}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-2 px-2 py-1.5 ${colors.light} ${colors.border} border rounded-lg`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: colors.dot }}
                        />
                        <span className="text-xs font-bold text-gray-700">
                          {count} {roomType === 'deluxe' ? 'Deluxe' : roomType === 'regular' ? 'Standard' : 'Suite'}
                        </span>
                      </motion.div>
                    );
                  })}
                  
                  {/* Show blocks */}
                  {Object.entries(blockCounts).map(([roomType, count]) => {
                    if (count === 0) return null;
                    const colors = roomColors[roomType as keyof typeof roomColors];
                    
                    return (
                      <motion.div
                        key={`block-${roomType}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-2 px-2 py-1.5 bg-gray-100 border border-gray-300 rounded-lg opacity-75`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-sm shadow-sm"
                          style={{ backgroundColor: colors.dot }}
                        />
                        <span className="text-xs font-bold text-gray-600">
                          {count} {roomType === 'deluxe' ? 'Deluxe' : roomType === 'regular' ? 'Standard' : 'Suite'} (blocked)
                        </span>
                      </motion.div>
                    );
                  })}
                  
                  {totalActivity > 3 && (
                    <div className="text-xs text-[#1B4B9E] font-bold bg-blue-100 px-2 py-1 rounded-lg text-center">
                      +{totalActivity - 3} more
                    </div>
                  )}
                </div>
              )}

              {hasActivity && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2"
                >
                  <div className="bg-gradient-to-br from-[#1B4B9E] to-[#2563B8] text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
                    {totalActivity}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCalendar;
