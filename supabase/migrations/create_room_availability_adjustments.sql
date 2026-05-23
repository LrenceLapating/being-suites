-- Create table for tracking manual room availability adjustments
-- This allows admins to account for external bookings (Booking.com, Airbnb, etc.)

CREATE TABLE IF NOT EXISTS public.room_availability_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_type VARCHAR NOT NULL REFERENCES room_types(type),
  adjustment_date DATE NOT NULL,
  adjustment_count INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_room_availability_adjustments_room_type_date 
ON room_availability_adjustments(room_type, adjustment_date);

-- Add RLS policy
ALTER TABLE room_availability_adjustments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on room_availability_adjustments" 
ON room_availability_adjustments FOR ALL USING (true);

-- Add comment
COMMENT ON TABLE room_availability_adjustments IS 'Tracks manual adjustments to room availability for external bookings (Booking.com, Airbnb, etc.)';

-- Add trigger for updated_at
CREATE TRIGGER update_room_availability_adjustments_updated_at
  BEFORE UPDATE ON room_availability_adjustments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();