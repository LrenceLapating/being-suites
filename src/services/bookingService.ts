import { supabase, NewBooking, Booking } from '../lib/supabase';
import { ROOM_INVENTORY } from './roomAvailabilityService';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getAllDatesInRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

/**
 * Fetch all fully booked dates for a specific room type
 * A date is fully booked when the number of bookings + blocks equals the room inventory
 */
export const getBookedDates = async (roomType: string): Promise<Date[]> => {
  try {
    // Get all confirmed bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('check_in_date, check_out_date')
      .eq('room_type', roomType)
      .eq('status', 'confirmed');

    if (bookingsError) throw bookingsError;

    // Get all room blocks
    const { data: blocks, error: blocksError } = await supabase
      .from('room_availability_adjustments')
      .select('check_in_date, check_out_date, adjustment_count')
      .eq('room_type', roomType);

    if (blocksError) throw blocksError;

    const maxRooms = ROOM_INVENTORY[roomType as keyof typeof ROOM_INVENTORY] || 1;
    
    // Get all unique dates from all bookings and blocks
    const allDatesSet = new Set<string>();
    
    // Add dates from bookings
    bookings?.forEach((booking) => {
      const [startYear, startMonth, startDay] = booking.check_in_date.split('-').map(Number);
      const [endYear, endMonth, endDay] = booking.check_out_date.split('-').map(Number);
      
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);
      
      const datesInRange = getAllDatesInRange(startDate, endDate);
      datesInRange.forEach(date => {
        allDatesSet.add(date.toISOString().split('T')[0]);
      });
    });

    // Add dates from blocks
    blocks?.forEach((block) => {
      const [startYear, startMonth, startDay] = block.check_in_date.split('-').map(Number);
      const [endYear, endMonth, endDay] = block.check_out_date.split('-').map(Number);
      
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);
      
      const datesInRange = getAllDatesInRange(startDate, endDate);
      datesInRange.forEach(date => {
        allDatesSet.add(date.toISOString().split('T')[0]);
      });
    });

    // Check each unique date to see if it's fully booked
    const fullyBookedDates: Date[] = [];
    allDatesSet.forEach(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Count bookings for this date
      const bookingCount = bookings?.filter(booking => {
        return dateStr >= booking.check_in_date && dateStr <= booking.check_out_date;
      }).length || 0;

      // Count blocked rooms for this date
      const blockedCount = blocks?.filter(block => {
        return dateStr >= block.check_in_date && dateStr <= block.check_out_date;
      }).reduce((sum, block) => sum + block.adjustment_count, 0) || 0;
      
      // If total bookings + blocks >= max rooms, mark as fully booked
      if (bookingCount + blockedCount >= maxRooms) {
        fullyBookedDates.push(date);
      }
    });

    return fullyBookedDates;
  } catch (error) {
    console.error('Error fetching booked dates:', error);
    throw error;
  }
};

/**
 * Check if a date range is available for a room type
 * Returns available: true only if ALL dates in the range have at least one room available
 */
export const checkDateRangeAvailability = async (
  roomType: string,
  startDate: Date,
  endDate: Date
): Promise<{ available: boolean; conflictDates: Date[]; availableRooms: number }> => {
  try {
    const checkInStr = startDate.toISOString().split('T')[0];
    const checkOutStr = endDate.toISOString().split('T')[0];

    // Get all confirmed bookings that overlap with the requested range
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('check_in_date, check_out_date')
      .eq('room_type', roomType)
      .eq('status', 'confirmed')
      .or(`and(check_in_date.lte.${checkOutStr},check_out_date.gte.${checkInStr})`);

    if (bookingsError) throw bookingsError;

    // Get all room blocks that overlap with the requested range
    const { data: blocks, error: blocksError } = await supabase
      .from('room_availability_adjustments')
      .select('check_in_date, check_out_date, adjustment_count')
      .eq('room_type', roomType)
      .or(`and(check_in_date.lte.${checkOutStr},check_out_date.gte.${checkInStr})`);

    if (blocksError) throw blocksError;

    const maxRooms = ROOM_INVENTORY[roomType as keyof typeof ROOM_INVENTORY] || 1;
    const requestedDates = getAllDatesInRange(startDate, endDate);
    
    const conflictDates: Date[] = [];
    let minAvailableRooms = maxRooms;

    // Check each requested date
    requestedDates.forEach(requestedDate => {
      const dateStr = requestedDate.toISOString().split('T')[0];
      
      // Count bookings for this date
      const bookingCount = bookings?.filter(booking => {
        return dateStr >= booking.check_in_date && dateStr <= booking.check_out_date;
      }).length || 0;

      // Count blocked rooms for this date
      const blockedCount = blocks?.filter(block => {
        return dateStr >= block.check_in_date && dateStr <= block.check_out_date;
      }).reduce((sum, block) => sum + block.adjustment_count, 0) || 0;

      const availableRooms = maxRooms - bookingCount - blockedCount;
      
      // Track minimum available rooms across the range
      if (availableRooms < minAvailableRooms) {
        minAvailableRooms = availableRooms;
      }
      
      // If no rooms available on this date, it's a conflict
      if (availableRooms <= 0) {
        conflictDates.push(requestedDate);
      }
    });

    return {
      available: conflictDates.length === 0,
      conflictDates,
      availableRooms: Math.max(0, minAvailableRooms),
    };
  } catch (error) {
    console.error('Error checking date range availability:', error);
    throw error;
  }
};

/**
 * Get available room count for a specific date range
 */
export const getAvailableRoomCount = async (
  roomType: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  try {
    const result = await checkDateRangeAvailability(roomType, startDate, endDate);
    return result.availableRooms;
  } catch (error) {
    console.error('Error getting available room count:', error);
    return 0;
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (
  bookingData: NewBooking
): Promise<Booking> => {
  try {
    const checkInDate = formatDate(new Date(bookingData.check_in_date));
    const checkOutDate = formatDate(new Date(bookingData.check_out_date));

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          ...bookingData,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          status: 'confirmed',
        },
      ])
      .select()
      .single();

    if (error) {
      // Handle specific error messages from database trigger
      if (error.message.includes('fully booked') || error.message.includes('already booked')) {
        throw new Error('All rooms of this type are fully booked for the selected dates. Please choose different dates or a different room type.');
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Get all bookings for a specific room type
 */
export const getBookingsByRoomType = async (
  roomType: string
): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('room_type', roomType)
      .eq('status', 'confirmed')
      .order('check_in_date', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (id: string): Promise<Booking | null> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

/**
 * Cancel a booking (update status to cancelled)
 */
export const cancelBooking = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

/**
 * Get all bookings (for admin purposes)
 */
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

/**
 * Mark a booking as completed
 */
export const completeBooking = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error completing booking:', error);
    throw error;
  }
};
