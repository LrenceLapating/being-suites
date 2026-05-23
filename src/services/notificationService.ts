import { supabase, BookingNotification } from '../lib/supabase';

/**
 * Get active notifications (not cleared)
 */
export const getActiveNotifications = async (limit: number = 50): Promise<BookingNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        booking:bookings(*)
      `)
      .eq('is_cleared', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching active notifications:', error);
    throw error;
  }
};

/**
 * Get cleared notifications (history)
 */
export const getClearedNotifications = async (limit: number = 100): Promise<BookingNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        booking:bookings(*)
      `)
      .eq('is_cleared', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching cleared notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};



/**
 * Get unread notification count (only active notifications)
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('is_cleared', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Clear all active notifications (move to history)
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_cleared: true, is_read: true })
      .eq('is_cleared', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    throw error;
  }
};

/**
 * Clear a single notification (move to history)
 */
export const clearNotification = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_cleared: true, is_read: true })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing notification:', error);
    throw error;
  }
};

/**
 * Permanently delete a notification
 */
export const permanentlyDeleteNotification = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error permanently deleting notification:', error);
    throw error;
  }
};

/**
 * Permanently delete all cleared notifications
 */
export const permanentlyDeleteAllCleared = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('is_cleared', true);

    if (error) throw error;
  } catch (error) {
    console.error('Error permanently deleting cleared notifications:', error);
    throw error;
  }
};
