import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Home, Save, AlertCircle } from 'lucide-react';
import { createRoomBlock, ROOM_INVENTORY, checkRoomAvailabilityForRange } from '../../services/roomAvailabilityService';

interface RoomBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RoomBlockModal: React.FC<RoomBlockModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [roomType, setRoomType] = useState<'regular' | 'deluxe' | 'suite'>('regular');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomCount, setRoomCount] = useState(1);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomNames = {
    regular: 'Standard',
    deluxe: 'Deluxe',
    suite: 'Twin Bed',
  };

  const roomColors = {
    regular: 'from-emerald-500 to-emerald-600',
    deluxe: 'from-[#1B4B9E] to-[#2563B8]',
    suite: 'from-purple-500 to-purple-600',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkInDate || !checkOutDate) {
      setError('Please select both check-in and check-out dates');
      return;
    }

    // Parse dates manually to avoid timezone issues
    // When using new Date("2026-05-17"), JS treats it as UTC which shifts the date
    // Instead, parse the components and create a local date
    const [checkInYear, checkInMonth, checkInDay] = checkInDate.split('-').map(Number);
    const [checkOutYear, checkOutMonth, checkOutDay] = checkOutDate.split('-').map(Number);
    
    const checkIn = new Date(checkInYear, checkInMonth - 1, checkInDay);
    const checkOut = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);

    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      return;
    }

    if (roomCount <= 0 || roomCount > ROOM_INVENTORY[roomType]) {
      setError(`Room count must be between 1 and ${ROOM_INVENTORY[roomType]}`);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Check current availability for the selected date range
      const availabilityCheck = await checkRoomAvailabilityForRange(
        roomType,
        checkIn,
        checkOut
      );

      // Validate that we're not over-blocking
      if (roomCount > availabilityCheck.availableRooms) {
        const totalRooms = ROOM_INVENTORY[roomType];
        const alreadyOccupied = totalRooms - availabilityCheck.availableRooms;
        
        setError(
          `Cannot block ${roomCount} room${roomCount > 1 ? 's' : ''}. ` +
          `Only ${availabilityCheck.availableRooms} out of ${totalRooms} ${roomNames[roomType]} room${totalRooms > 1 ? 's are' : ' is'} available for these dates. ` +
          `(${alreadyOccupied} already booked/blocked)`
        );
        setSaving(false);
        return;
      }

      await createRoomBlock(
        roomType,
        checkIn,
        checkOut,
        roomCount,
        reason || undefined
      );

      // Reset form
      setRoomType('regular');
      setCheckInDate('');
      setCheckOutDate('');
      setRoomCount(1);
      setReason('');
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating room block:', err);
      setError(err.message || 'Failed to create room block');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Block Room</h3>
                  <p className="text-blue-100 text-sm">External booking</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={saving}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Room Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Room Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(roomNames).map(([type, name]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRoomType(type as any)}
                    className={`p-3 rounded-xl text-sm font-semibold transition-all ${
                      roomType === type
                        ? `bg-gradient-to-r ${roomColors[type as keyof typeof roomColors]} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={today}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1B4B9E] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || today}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1B4B9E] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Room Count */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Number of Rooms to Block
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={ROOM_INVENTORY[roomType]}
                  value={roomCount}
                  onChange={(e) => setRoomCount(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1B4B9E] focus:outline-none transition-colors text-center"
                />
                <span className="text-sm text-gray-600">
                  out of {ROOM_INVENTORY[roomType]} {roomNames[roomType]} rooms
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Booking.com, Airbnb, Walk-in"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1B4B9E] focus:outline-none transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] text-white rounded-lg hover:from-[#2563B8] hover:to-[#1B4B9E] transition-all font-semibold disabled:opacity-50 shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Block Room
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RoomBlockModal;