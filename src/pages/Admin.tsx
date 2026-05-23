import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Filter, 
  Download,
  RefreshCw,
  TrendingUp,
  X,
  LogOut,
  History,
  Package,
  Trash2
} from 'lucide-react';
import { getAllBookings, cancelBooking, completeBooking } from '../services/bookingService';
import { Booking, supabase } from '../lib/supabase';
import AdminCalendar from '../components/admin/AdminCalendar';
import BookingDetailsModal from '../components/admin/BookingDetailsModal';
import NotificationBell from '../components/admin/NotificationBell';
import AdminLogin from '../components/admin/AdminLogin';
import RoomAvailabilityTracker from '../components/admin/RoomAvailabilityTracker';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { cleanupExpiredRoomBlocks } from '../services/roomAvailabilityService';
import logoUrl from '../assets/Being logo.png';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('confirmed');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateBookings, setSelectedDateBookings] = useState<Booking[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const roomNames = {
    deluxe: 'Deluxe Room',
    regular: 'Standard Room',
    suite: 'Twin Bed Suite',
  };

  // Check if already logged in (Supabase session)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.app_metadata?.role === 'admin') {
        setIsAuthenticated(true);
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.app_metadata?.role === 'admin') {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch all bookings
  const fetchBookings = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const data = await getAllBookings();
      setBookings(data);
      setFilteredBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setErrorState('Failed to load bookings');
      error('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if authenticated
    if (!isAuthenticated) return;

    fetchBookings();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Apply filters
  useEffect(() => {
    let filtered = [...bookings];

    // Filter by room type
    if (filterRoom !== 'all') {
      filtered = filtered.filter((b) => b.room_type === filterRoom);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    setFilteredBookings(filtered);
  }, [filterRoom, filterStatus, bookings]);

  // Handle date click
  const handleDateClick = (date: Date, dateBookings: Booking[], dateBlocks: any[]) => {
    setSelectedDate(date);
    setSelectedDateBookings(dateBookings);
    // Note: blocks are shown in the modal but not editable for now
  };

  // Cancel booking
  const handleCancelBooking = async (id: string) => {
    try {
      await cancelBooking(id);
      success('Booking cancelled successfully!');
      await fetchBookings();
      setSelectedDate(null);
      setSelectedDateBookings([]);
    } catch (err: any) {
      console.error('Cancel error:', err);
      error(err.message || 'Failed to cancel booking. Please try again.');
    }
  };

  // Complete booking
  const handleCompleteBooking = async (id: string) => {
    try {
      await completeBooking(id);
      success('Booking marked as completed!');
      await fetchBookings();
      setSelectedDate(null);
      setSelectedDateBookings([]);
    } catch (err: any) {
      console.error('Complete error:', err);
      error(err.message || 'Failed to complete booking. Please try again.');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Room Type', 'Guest Name', 'Email', 'Phone', 'Status', 'Booked On'];
    const rows = filteredBookings.map((b) => [
      new Date(b.check_in_date).toLocaleDateString(),
      roomNames[b.room_type as keyof typeof roomNames],
      b.full_name,
      b.email,
      b.contact_number,
      b.status,
      new Date(b.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Manual cleanup of expired room blocks
  const handleCleanupExpiredBlocks = async () => {
    setIsCleaningUp(true);
    try {
      const result = await cleanupExpiredRoomBlocks();
      if (result.deletedCount > 0) {
        success(`Cleaned up ${result.deletedCount} expired room block${result.deletedCount > 1 ? 's' : ''}!`);
      } else {
        success('No expired room blocks found to clean up.');
      }
      // Refresh the calendar to reflect changes
      await fetchBookings();
    } catch (err: any) {
      console.error('Cleanup error:', err);
      error(err.message || 'Failed to cleanup expired blocks. Please try again.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    thisMonth: bookings.filter((b) => {
      const bookingDate = new Date(b.check_in_date);
      const now = new Date();
      return bookingDate.getMonth() === now.getMonth() && 
             bookingDate.getFullYear() === now.getFullYear() &&
             b.status === 'confirmed';
    }).length,
  };

  const handleLogin = () => {
    // Authentication is handled in AdminLogin component
    // This is just called after successful login
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl} 
                alt="Being Suites Logo" 
                className="h-12 w-auto"
              />
              <div className="border-l border-gray-300 pl-3">
                <h1 className="text-2xl font-serif font-bold text-[#1B4B9E] mb-0">
                  Being Suites
                </h1>
                <p className="text-sm font-medium text-[#D42B2B]">Admin Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Inventory Button */}
            <button
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Inventory</span>
            </button>

            {/* History Button */}
            <button
              onClick={() => navigate('/booking-history')}
              className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] hover:from-[#2563B8] hover:to-[#1B4B9E] rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <History className="h-5 w-5" />
              <span className="font-medium">Booking History</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-[#6B7280] hover:text-[#D42B2B] hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-full mx-auto mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] rounded-lg p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">Confirmed</p>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-[#D42B2B] to-red-600 rounded-lg p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm mb-1">Cancelled</p>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                </div>
                <X className="h-8 w-8 text-red-200" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">This Month</p>
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Room Availability Tracker */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RoomAvailabilityTracker onUpdate={fetchBookings} />
            </motion.div>

            {/* Filters and Actions */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Actions</h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1B4B9E] text-white rounded-lg hover:bg-[#D42B2B] transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={fetchBookings}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1B4B9E] text-white rounded-lg hover:bg-[#D42B2B] transition-colors text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>

                {/* Cleanup Button */}
                <button
                  onClick={handleCleanupExpiredBlocks}
                  disabled={isCleaningUp}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCleaningUp ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Clean Expired Blocks
                    </>
                  )}
                </button>

                {/* Filter Options */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t border-gray-300"
                    >
                      <div>
                        <label className="block text-sm font-medium text-[#6B7280] mb-2">
                          Room Type
                        </label>
                        <select
                          value={filterRoom}
                          onChange={(e) => setFilterRoom(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1B4B9E] focus:ring-2 focus:ring-[#1B4B9E]/20 outline-none text-sm"
                        >
                          <option value="all">All Rooms</option>
                          <option value="deluxe">Deluxe</option>
                          <option value="regular">Standard</option>
                          <option value="suite">Suite</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#6B7280] mb-2">
                          Status
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#1B4B9E] focus:ring-2 focus:ring-[#1B4B9E]/20 outline-none text-sm"
                        >
                          <option value="all">All Status</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 text-[#1B4B9E] animate-spin mx-auto mb-4" />
                <p className="text-[#6B7280]">Loading bookings...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {errorState && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <p className="text-red-700 text-center">{errorState}</p>
              </div>
            </div>
          )}

          {/* Calendar View */}
          {!isLoading && !errorState && (
            <div className="h-full">
              <AdminCalendar
                bookings={filteredBookings}
                onDateClick={handleDateClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedDate && selectedDateBookings.length > 0 && (
          <BookingDetailsModal
            date={selectedDate}
            bookings={selectedDateBookings}
            onClose={() => {
              setSelectedDate(null);
              setSelectedDateBookings([]);
            }}
            onCancel={handleCancelBooking}
            onComplete={handleCompleteBooking}
          />
        )}
      </AnimatePresence>

      {/* Floating Notification Bell */}
      <div className="fixed bottom-8 right-8 z-50">
        <NotificationBell />
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Admin;
