import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomSelection from '../components/booking/RoomSelection';
import CalendarView from '../components/booking/CalendarView';
import BookingForm from '../components/booking/BookingForm';
import WaveDivider from '../components/booking/WaveDivider';

export type RoomType = 'deluxe' | 'regular' | 'suite';

export interface BookingData {
  roomType: RoomType | null;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  guestInfo: {
    fullName: string;
    contactNumber: string;
    email: string;
  };
}

const Booking: React.FC = () => {
  const [step, setStep] = useState<'room' | 'calendar' | 'form'>('room');
  const [bookingData, setBookingData] = useState<BookingData>({
    roomType: null,
    checkInDate: null,
    checkOutDate: null,
    guestInfo: {
      fullName: '',
      contactNumber: '',
      email: '',
    },
  });

  const handleRoomSelect = (roomType: RoomType) => {
    setBookingData({ ...bookingData, roomType });
    setStep('calendar');
  };

  const handleDateSelect = (checkInDate: Date, checkOutDate: Date) => {
    setBookingData({ ...bookingData, checkInDate, checkOutDate });
    setStep('form');
  };

  const handleBack = () => {
    if (step === 'form') setStep('calendar');
    else if (step === 'calendar') setStep('room');
  };

  return (
    <div className="min-h-screen premium-booking">
      <AnimatePresence mode="wait">
        {step === 'room' && (
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RoomSelection onSelectRoom={handleRoomSelect} />
            <WaveDivider />
          </motion.div>
        )}

        {step === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CalendarView
              roomType={bookingData.roomType!}
              onSelectDate={handleDateSelect}
              onBack={handleBack}
            />
            <WaveDivider />
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <BookingForm
              bookingData={bookingData}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Booking;
