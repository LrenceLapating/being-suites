import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Calendar, User, Clock, History, Trash2 } from 'lucide-react';
import { BookingNotification } from '../../lib/supabase';
import {
  getActiveNotifications,
  getClearedNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotification,
  clearAllNotifications,
  permanentlyDeleteNotification,
  permanentlyDeleteAllCleared,
} from '../../services/notificationService';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [historyNotifications, setHistoryNotifications] = useState<BookingNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const roomNames = {
    deluxe: 'Deluxe Room',
    regular: 'Standard Room',
    suite: 'Twin Bed Suite',
  };

  const fetchNotifications = async () => {
    try {
      const [active, count] = await Promise.all([
        getActiveNotifications(50),
        getUnreadCount(),
      ]);
      
      setNotifications(active);
      setUnreadCount(count);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const cleared = await getClearedNotifications(100);
      setHistoryNotifications(cleared);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const previousCount = unreadCount;
      
      try {
        const [active, count] = await Promise.all([
          getActiveNotifications(50),
          getUnreadCount(),
        ]);
        
        setNotifications(active);
        setUnreadCount(count);

        if (count > previousCount) {
          try {
            playNotificationSound();
          } catch (err) {
            console.log('Could not play notification sound:', err);
          }

          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              const latestNotif = active[0];
              if (latestNotif?.booking) {
                new Notification('New Booking Received!', {
                  body: `${latestNotif.booking.full_name} booked ${roomNames[latestNotif.booking.room_type as keyof typeof roomNames]}`,
                  icon: '/Being logo.png',
                });
              }
            } catch (err) {
              console.log('Could not show browser notification:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing notifications:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [unreadCount]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not supported');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleClearNotification = async (id: string) => {
    try {
      await clearNotification(id);
      
      const notif = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      
      if (notif && !notif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await permanentlyDeleteNotification(id);
      setHistoryNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error permanently deleting notification:', error);
    }
  };

  const handleDeleteAllHistory = async () => {
    if (!confirm('Permanently delete all notification history? This cannot be undone.')) {
      return;
    }

    try {
      await permanentlyDeleteAllCleared();
      setHistoryNotifications([]);
    } catch (error) {
      console.error('Error deleting all history:', error);
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    fetchHistory();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const renderNotificationItem = (notification: BookingNotification, isHistory: boolean = false) => {
    if (!notification.booking) return null;

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-4 hover:bg-gray-50 transition-colors ${
          !notification.is_read && !isHistory ? 'bg-blue-50' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-[#1B4B9E] rounded-full flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900">
                New Booking Received
              </p>
              <button
                onClick={() => isHistory ? handlePermanentDelete(notification.id) : handleClearNotification(notification.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title={isHistory ? 'Delete permanently' : 'Clear notification'}
              >
                <X className="h-3 w-3 text-gray-600" />
              </button>
            </div>

            <div className="space-y-1 mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User className="h-3 w-3" />
                <span className="font-medium text-gray-900">
                  {notification.booking.full_name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>
                  {roomNames[notification.booking.room_type as keyof typeof roomNames]} - {' '}
                  {new Date(notification.booking.check_in_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{getTimeAgo(notification.created_at)}</span>
            </div>
          </div>

          {!notification.is_read && !isHistory && (
            <div className="flex-shrink-0 w-2 h-2 bg-[#D42B2B] rounded-full" />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative group">
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {unreadCount > 0 ? `${unreadCount} new booking${unreadCount !== 1 ? 's' : ''}` : 'Notifications'}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-4 bg-[#1B4B9E] text-white rounded-full shadow-2xl hover:bg-[#D42B2B] transition-all duration-300"
        style={{
          boxShadow: '0 10px 40px rgba(27, 75, 158, 0.3)',
        }}
        aria-label="Notifications"
      >
        <Bell className="h-7 w-7" />
        
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-[#D42B2B] text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}

        {unreadCount > 0 && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className="absolute inset-0 rounded-full bg-[#D42B2B]"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: 0.5,
              }}
              className="absolute inset-0 rounded-full bg-[#D42B2B]"
            />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => {
                setIsOpen(false);
                setShowHistory(false);
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-8 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col"
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#1B4B9E] to-[#2563B8] text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">
                    {showHistory ? 'Notification History' : 'Notifications'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowHistory(false);
                    }}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {!showHistory && unreadCount > 0 && (
                  <p className="text-sm text-white/90">
                    {unreadCount} new booking{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {!showHistory ? (
                <>
                  {notifications.length > 0 && (
                    <div className="p-3 border-b border-gray-200 flex gap-2 items-center">
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#1B4B9E] hover:underline"
                      >
                        Mark all read
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-[#D42B2B] hover:underline"
                      >
                        Clear all
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={handleShowHistory}
                        className="text-xs text-gray-600 hover:underline flex items-center gap-1"
                      >
                        <History className="h-3 w-3" />
                        History
                      </button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4B9E] mx-auto mb-3" />
                        <p className="text-gray-600">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">No new notifications</p>
                        <button
                          onClick={handleShowHistory}
                          className="text-sm text-[#1B4B9E] hover:underline flex items-center gap-1 mx-auto"
                        >
                          <History className="h-4 w-4" />
                          View History
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => renderNotificationItem(notification, false))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 border-b border-gray-200 flex gap-2 items-center">
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-xs text-[#1B4B9E] hover:underline"
                    >
                      ← Back to Active
                    </button>
                    {historyNotifications.length > 0 && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={handleDeleteAllHistory}
                          className="text-xs text-[#D42B2B] hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete All
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {historyNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">No notification history</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {historyNotifications.map((notification) => renderNotificationItem(notification, true))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
