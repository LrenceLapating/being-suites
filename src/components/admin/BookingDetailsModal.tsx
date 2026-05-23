import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Phone, Calendar, User, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { Booking } from '../../lib/supabase';
import ConfirmDialog from '../ConfirmDialog';

interface BookingDetailsModalProps {
  date: Date;
  bookings: Booking[];
  onClose: () => void;
  onCancel: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  date,
  bookings,
  onClose,
  onCancel,
  onComplete,
}) => {
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'complete';
    bookingId: string;
    guestName: string;
  } | null>(null);

  const roomNames = {
    deluxe: 'Deluxe Room',
    regular: 'Standard Room',
    suite: 'Twin Bed Suite',
  };

  const roomColors = {
    deluxe: '#1B4B9E',
    regular: '#10B981',
    suite: '#8B5CF6',
  };

  const handleCancel = async (id: string, guestName: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'cancel',
      bookingId: id,
      guestName,
    });
  };

  const handleComplete = async (id: string, guestName: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'complete',
      bookingId: id,
      guestName,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;

    const { type, bookingId } = confirmDialog;
    
    if (type === 'cancel') {
      setCancelling(bookingId);
    } else {
      setCompleting(bookingId);
    }

    setConfirmDialog(null);

    try {
      if (type === 'cancel') {
        await onCancel(bookingId);
      } else {
        await onComplete(bookingId);
      }
      // Success - modal will close automatically via parent component
    } catch (err: any) {
      console.error(`${type} error:`, err);
      if (type === 'cancel') {
        setCancelling(null);
      } else {
        setCompleting(null);
      }
    }
  };

  const handleCancelDialog = () => {
    setConfirmDialog(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div>
            <h3 className="text-3xl font-serif font-bold text-[#1B4B9E] mb-2">
              Bookings for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-[#6B7280]">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-[#6B7280]" />
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-[#F5F7FA] to-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#1B4B9E] transition-all"
            >
              {/* Room Type Badge */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="px-4 py-2 rounded-full text-white font-semibold text-sm"
                  style={{ backgroundColor: roomColors[booking.room_type as keyof typeof roomColors] }}
                >
                  {roomNames[booking.room_type as keyof typeof roomNames]}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              {/* Guest Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-[#1B4B9E] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Guest Name</p>
                    <p className="text-gray-900 font-semibold">{booking.full_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-[#1B4B9E] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Check-in</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(booking.check_in_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-[#1B4B9E] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Check-out</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(booking.check_out_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-[#1B4B9E] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booked On</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(booking.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[#1B4B9E] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contact Number</p>
                    <p className="text-gray-900 font-semibold">{booking.contact_number}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#1B4B9E] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email Address</p>
                    <p className="text-gray-900 font-semibold break-all">{booking.email}</p>
                  </div>
                </div>
              </div>

              {/* Booking ID */}
              <div className="mb-4">
                <p className="text-xs text-[#6B7280] mb-1">Booking ID</p>
                <p className="text-xs font-mono text-[#1A1A2E] bg-white p-2 rounded border border-gray-200">
                  {booking.id}
                </p>
              </div>

              {/* Actions */}
              {booking.status === 'confirmed' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleComplete(booking.id, booking.full_name)}
                    disabled={completing === booking.id || cancelling === booking.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {completing === booking.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Mark as Completed
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleCancel(booking.id, booking.full_name)}
                    disabled={cancelling === booking.id || completing === booking.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#D42B2B] text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling === booking.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Cancel Booking
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog?.isOpen || false}
        title={
          confirmDialog?.type === 'cancel'
            ? 'Cancel Booking'
            : 'Mark as Completed'
        }
        message={
          confirmDialog?.type === 'cancel'
            ? `Are you sure you want to cancel the booking for ${confirmDialog?.guestName}? This action cannot be undone.`
            : `Mark the booking for ${confirmDialog?.guestName} as completed? The guest will be checked out and the booking will move to history.`
        }
        confirmText={
          confirmDialog?.type === 'cancel' ? 'Cancel Booking' : 'Mark Completed'
        }
        cancelText="Keep Booking"
        type={confirmDialog?.type === 'cancel' ? 'danger' : 'success'}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelDialog}
      />
    </div>
  );
};

export default BookingDetailsModal;
