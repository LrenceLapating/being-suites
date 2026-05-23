-- SECURE RLS POLICIES FOR BEING SUITES
-- This replaces the insecure "USING (true)" policies with proper security

-- 1. DROP INSECURE POLICIES
DROP POLICY IF EXISTS "Allow all operations on room_availability_adjustments" ON room_availability_adjustments;

-- 2. SECURE BOOKINGS TABLE
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public to insert bookings (for customer bookings)
CREATE POLICY "Allow public booking creation" ON bookings
  FOR INSERT WITH CHECK (true);

-- Allow public to read their own bookings (with email verification)
CREATE POLICY "Allow users to read own bookings" ON bookings
  FOR SELECT USING (
    auth.jwt() ->> 'email' = email OR 
    auth.jwt() ->> 'role' = 'admin'
  );

-- Only admins can update/delete bookings
CREATE POLICY "Admin only booking modifications" ON bookings
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only booking deletions" ON bookings
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- 3. SECURE ROOM AVAILABILITY ADJUSTMENTS
-- Only admins can manage room availability
CREATE POLICY "Admin only room availability read" ON room_availability_adjustments
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only room availability insert" ON room_availability_adjustments
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only room availability update" ON room_availability_adjustments
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only room availability delete" ON room_availability_adjustments
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- 4. SECURE INVENTORY TABLES (if they exist)
DO $$ 
BEGIN
  -- Check if items table exists and secure it
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'items') THEN
    ALTER TABLE items ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admin only items access" ON items
      FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
  END IF;

  -- Check if transactions table exists and secure it
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admin only transactions access" ON transactions
      FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
  END IF;

  -- Check if balances table exists and secure it
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'balances') THEN
    ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admin only balances access" ON balances
      FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
  END IF;
END $$;

-- 5. CREATE AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admin only audit log access" ON audit_log
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 6. CREATE AUDIT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    old_data,
    new_data,
    user_id,
    user_email
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    auth.jwt() ->> 'email'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ADD AUDIT TRIGGERS TO SENSITIVE TABLES
CREATE TRIGGER bookings_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER room_availability_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON room_availability_adjustments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 8. CREATE SECURITY FUNCTIONS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. ADD RATE LIMITING TABLE
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or user ID
  action TEXT NOT NULL, -- login_attempt, booking_creation, etc.
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action 
ON rate_limits(identifier, action);

-- 10. COMMENTS FOR DOCUMENTATION
COMMENT ON POLICY "Allow public booking creation" ON bookings IS 
'Allows anyone to create bookings - required for customer booking form';

COMMENT ON POLICY "Allow users to read own bookings" ON bookings IS 
'Users can only see their own bookings by email, admins can see all';

COMMENT ON POLICY "Admin only booking modifications" ON bookings IS 
'Only authenticated admins can modify existing bookings';

COMMENT ON TABLE audit_log IS 
'Tracks all changes to sensitive data for security and compliance';

COMMENT ON TABLE rate_limits IS 
'Prevents abuse by limiting actions per IP/user within time windows';