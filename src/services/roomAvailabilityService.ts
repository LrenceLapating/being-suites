import { supabase } from '../lib/supabase';

// Room inventory - number of rooms available per type
export const ROOM_INVENTORY = {
  regular: 8,  // Standard rooms
  deluxe: 4,   // Deluxe rooms
  suite: 2,    // Twin Bed suites
};

export interface RoomAvailabilityAdjustment {
  id: string;
  room_type: 'regular' | 'deluxe' | 'suite';
  check_in_date: string;
  check_out_date: string;
  adjustment_count: number;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomAvailability {
  room_type: 'regular' | 'deluxe' | 'suite';
  total_rooms: number;
  booked_rooms: number;
  blocked_rooms: number;
  available_rooms: number;
}

/**
 * Get room availability for a specific date
 */
export const getRoomAvailabilityForDate = async (date: Date): Promise<RoomAvailability[]> => {
  try {
    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Get all confirmed bookings for this date
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('room_type')
      .eq('status', 'confirmed')
      .lte('check_in_date', dateStr)
      .gte('check_out_date', dateStr);

    if (bookingsError) throw bookingsError;

    // Get manual blocks for this date
    const { data: blocks, error: blocksError } = await supabase
      .from('room_availability_adjustments')
      .select('room_type, adjustment_count')
      .lte('check_in_date', dateStr)
      .gte('check_out_date', dateStr);

    if (blocksError) throw blocksError;

    // Calculate availability for each room type
    const availability: RoomAvailability[] = [];
    
    for (const [roomType, totalRooms] of Object.entries(ROOM_INVENTORY)) {
      const bookedRooms = bookings?.filter(b => b.room_type === roomType).length || 0;
      
      // Sum up all blocked rooms for this room type on this date
      const blockedRooms = blocks?.filter(b => b.room_type === roomType)
        .reduce((sum, block) => sum + block.adjustment_count, 0) || 0;
      
      const availableRooms = Math.max(0, totalRooms - bookedRooms - blockedRooms);

      availability.push({
        room_type: roomType as keyof typeof ROOM_INVENTORY,
        total_rooms: totalRooms,
        booked_rooms: bookedRooms,
        blocked_rooms: blockedRooms,
        available_rooms: availableRooms,
      });
    }

    return availability;
  } catch (error) {
    console.error('Error getting room availability:', error);
    throw error;
  }
};

/**
 * Get current room availability for today
 */
export const getCurrentRoomAvailability = async (): Promise<RoomAvailability[]> => {
  return getRoomAvailabilityForDate(new Date());
};

/**
 * Create a new room block for external bookings
 */
export const createRoomBlock = async (
  roomType: 'regular' | 'deluxe' | 'suite',
  checkInDate: Date,
  checkOutDate: Date,
  roomCount: number = 1,
  reason?: string
): Promise<void> => {
  try {
    // Format dates as YYYY-MM-DD in local timezone
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const checkInStr = formatLocalDate(checkInDate);
    const checkOutStr = formatLocalDate(checkOutDate);

    const { error } = await supabase
      .from('room_availability_adjustments')
      .insert({
        room_type: roomType,
        check_in_date: checkInStr,
        check_out_date: checkOutStr,
        adjustment_count: roomCount,
        reason: reason || 'External booking',
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating room block:', error);
    throw error;
  }
};

/**
 * Get all room blocks (for displaying on calendar)
 * Only returns current and future blocks, filters out past blocks
 */
export const getAllRoomBlocks = async (): Promise<RoomAvailabilityAdjustment[]> => {
  try {
    // Get today's date in YYYY-MM-DD format (local timezone)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const { data, error } = await supabase
      .from('room_availability_adjustments')
      .select('*')
      .gte('check_out_date', todayStr) // Only get blocks that haven't ended yet
      .order('check_in_date', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting room blocks:', error);
    throw error;
  }
};

/**
 * Get room blocks for a specific room type
 */
export const getRoomBlocksByType = async (
  roomType: 'regular' | 'deluxe' | 'suite'
): Promise<RoomAvailabilityAdjustment[]> => {
  try {
    const { data, error } = await supabase
      .from('room_availability_adjustments')
      .select('*')
      .eq('room_type', roomType)
      .order('check_in_date', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting room blocks by type:', error);
    throw error;
  }
};

/**
 * Delete a room block
 */
export const deleteRoomBlock = async (blockId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('room_availability_adjustments')
      .delete()
      .eq('id', blockId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting room block:', error);
    throw error;
  }
};

/**
 * Clean up expired room blocks (blocks where check_out_date is before today)
 * This function can be called periodically to maintain database cleanliness
 */
export const cleanupExpiredRoomBlocks = async (): Promise<{ deletedCount: number }> => {
  try {
    // Get yesterday's date in YYYY-MM-DD format (local timezone)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${year}-${month}-${day}`;

    const { data, error } = await supabase
      .from('room_availability_adjustments')
      .delete()
      .lt('check_out_date', yesterdayStr)
      .select('id'); // Return deleted records to count them

    if (error) throw error;

    const deletedCount = data?.length || 0;
    
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired room blocks`);
    }

    return { deletedCount };
  } catch (error) {
    console.error('Error cleaning up expired room blocks:', error);
    throw error;
  }
};

/**
 * Check if a date range has available rooms for booking
 * This is used by the guest booking system
 */
export const checkRoomAvailabilityForRange = async (
  roomType: 'regular' | 'deluxe' | 'suite',
  checkInDate: Date,
  checkOutDate: Date
): Promise<{ available: boolean; availableRooms: number; conflictDates: Date[] }> => {
  try {
    // Format dates as YYYY-MM-DD in local timezone
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const checkInStr = formatLocalDate(checkInDate);
    const checkOutStr = formatLocalDate(checkOutDate);

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

    const maxRooms = ROOM_INVENTORY[roomType];
    const conflictDates: Date[] = [];
    let minAvailableRooms = maxRooms;

    // Check each date in the requested range
    const currentDate = new Date(checkInDate);
    while (currentDate <= checkOutDate) {
      const dateStr = formatLocalDate(currentDate);
      
      // Count bookings for this date
      const bookingCount = bookings?.filter(booking => {
        return dateStr >= booking.check_in_date && dateStr <= booking.check_out_date;
      }).length || 0;

      // Count blocked rooms for this date
      const blockedCount = blocks?.filter(block => {
        return dateStr >= block.check_in_date && dateStr <= block.check_out_date;
      }).reduce((sum, block) => sum + block.adjustment_count, 0) || 0;

      const availableRooms = maxRooms - bookingCount - blockedCount;
      
      if (availableRooms < minAvailableRooms) {
        minAvailableRooms = availableRooms;
      }

      if (availableRooms <= 0) {
        conflictDates.push(new Date(currentDate));
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      available: conflictDates.length === 0,
      availableRooms: Math.max(0, minAvailableRooms),
      conflictDates,
    };
  } catch (error) {
    console.error('Error checking room availability for range:', error);
    throw error;
  }
};