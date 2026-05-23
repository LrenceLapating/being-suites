import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Filter, Calendar, User, Phone, Mail, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { Booking } from '../lib/supabase';
import { getAllBookings } from '../services/bookingService';
import { useNavigate } from 'react-router-dom';

const BookingHistory: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<'all' | 'deluxe' | 'regular' | 'suite'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, roomTypeFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      
      // Filter to show only past bookings (check-out date has passed) or cancelled/completed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const pastBookings = data.filter(booking => {
        const [year, month, day] = booking.check_out_date.split('-').map(Number);
        const checkOutDate = new Date(year, month - 1, day);
        
        return checkOutDate < today || booking.status === 'cancelled' || booking.status === 'completed';
      });
      
      setBookings(pastBookings);
    } catch (error) {
      console.error('Error loading booking history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Room type filter
    if (roomTypeFilter !== 'all') {
      filtered = filtered.filter(b => b.room_type === roomTypeFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.full_name.toLowerCase().includes(term) ||
        b.email.toLowerCase().includes(term) ||
        b.contact_number.includes(term)
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
    };

    const icons = {
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      confirmed: <Clock className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoomTypeBadge = (roomType: string) => {
    const styles = {
      deluxe: 'bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] text-white',
      regular: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
      suite: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
    };

    return (
      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${styles[roomType as keyof typeof styles]}`}>
        {roomType === 'deluxe' ? 'Deluxe' : roomType === 'regular' ? 'Standard' : 'Suite'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1B4B9E] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading booking history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1B4B9E] to-[#2563B8] rounded-2xl flex items-center justify-center shadow-lg">
                <History className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] bg-clip-text text-transparent">
                  Booking History
                </h1>
                <p className="text-gray-600 font-medium">View all past bookings</p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] hover:from-[#2563B8] hover:to-[#1B4B9E] rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B4B9E] focus:outline-none transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B4B9E] focus:outline-none transition-colors appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Room Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B4B9E] focus:outline-none transition-colors appearance-none bg-white"
              >
                <option value="all">All Room Types</option>
                <option value="deluxe">Deluxe</option>
                <option value="regular">Standard</option>
                <option value="suite">Suite</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-bold text-[#1B4B9E]">{filteredBookings.length}</span> of{' '}
            <span className="font-bold">{bookings.length}</span> bookings
          </div>
        </motion.div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No bookings found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Room Type */}
                  <div className="md:col-span-2">
                    {getRoomTypeBadge(booking.room_type)}
                  </div>

                  {/* Guest Info */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-800">{booking.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{booking.contact_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{booking.email}</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="md:col-span-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-700">
                        {formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Booked: {new Date(booking.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* ID (for reference) */}
                  <div className="md:col-span-1 text-right">
                    <span className="text-xs text-gray-400 font-mono">
                      #{booking.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
