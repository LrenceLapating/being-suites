import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid VITE_SUPABASE_URL format: ${supabaseUrl}`);
}

// Validate URL is HTTPS and looks like a Supabase URL
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface RoomType {
  id: string;
  type: 'deluxe' | 'regular' | 'suite';
  name: string;
  description: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  room_type: 'deluxe' | 'regular' | 'suite';
  check_in_date: string;
  check_out_date: string;
  full_name: string;
  contact_number: string;
  email: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface NewBooking {
  room_type: 'deluxe' | 'regular' | 'suite';
  check_in_date: string;
  check_out_date: string;
  full_name: string;
  contact_number: string;
  email: string;
}

export interface BookingNotification {
  id: string;
  booking_id: string;
  is_read: boolean;
  is_cleared: boolean;
  created_at: string;
  booking?: Booking;
}
