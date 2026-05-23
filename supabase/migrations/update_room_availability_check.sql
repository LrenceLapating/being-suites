-- Update the room availability check function to support multiple rooms per type
-- This allows multiple bookings for the same room type as long as inventory is available

CREATE OR REPLACE FUNCTION public.check_room_date_range_availability()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  room_inventory INTEGER;
  booking_count INTEGER;
BEGIN
  -- Define room inventory per type
  CASE NEW.room_type
    WHEN 'regular' THEN room_inventory := 8;  -- Standard rooms
    WHEN 'deluxe' THEN room_inventory := 4;   -- Deluxe rooms
    WHEN 'suite' THEN room_inventory := 2;    -- Twin Bed suites
    ELSE room_inventory := 1;                 -- Default fallback
  END CASE;

  -- Count existing confirmed bookings that overlap with the new booking date range
  SELECT COUNT(*) INTO booking_count
  FROM bookings
  WHERE room_type = NEW.room_type
    AND status = 'confirmed'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      -- Check for date range overlap
      (NEW.check_in_date <= check_out_date AND NEW.check_out_date >= check_in_date)
    );

  -- If booking count equals or exceeds room inventory, raise exception
  IF booking_count >= room_inventory THEN
    RAISE EXCEPTION 'All rooms are fully booked for one or more dates in this range. Available rooms: %, Current bookings: %', room_inventory, booking_count;
  END IF;

  RETURN NEW;
END;
$function$;

-- Comment explaining the change
COMMENT ON FUNCTION public.check_room_date_range_availability() IS 
'Validates room availability based on inventory limits. Allows multiple bookings per room type until inventory is exhausted. Room inventory: Standard=8, Deluxe=4, Suite=2';
