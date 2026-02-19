-- Supabase Database Schema
-- Run this in Supabase SQL Editor to create the required tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Index for faster status queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ORDER_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster order lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- =====================================================
-- Enable RLS (uncomment if you want to use RLS policies)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (uncomment and customize as needed)
-- Allow service role to do everything
-- CREATE POLICY "Service role can do everything on users"
--   ON users FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Service role can do everything on orders"
--   ON orders FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Service role can do everything on order_items"
--   ON order_items FOR ALL
--   TO service_role
--   USING (true)
--   WITH CHECK (true);

-- =====================================================
-- VIEWS - For easier data access
-- =====================================================

-- View: Complete order details with user information
CREATE OR REPLACE VIEW order_details AS
SELECT
  o.id AS order_id,
  o.total_amount,
  o.status,
  o.order_date,
  u.id AS user_id,
  u.name AS user_name,
  u.email AS user_email,
  u.mobile AS user_mobile,
  COUNT(oi.id) AS item_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.id;

-- =====================================================
-- FUNCTIONS - Useful database functions
-- =====================================================

-- Function: Get order total from items (for validation)
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS DECIMAL(10, 2) AS $$
  SELECT COALESCE(SUM(subtotal), 0)
  FROM order_items
  WHERE order_id = order_uuid;
$$ LANGUAGE SQL STABLE;

-- Function: Get user order count
CREATE OR REPLACE FUNCTION get_user_order_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM orders
  WHERE user_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Function: Get user total spent
CREATE OR REPLACE FUNCTION get_user_total_spent(user_uuid UUID)
RETURNS DECIMAL(10, 2) AS $$
  SELECT COALESCE(SUM(total_amount), 0)
  FROM orders
  WHERE user_id = user_uuid AND status = 'completed';
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample user
-- INSERT INTO users (name, email, mobile) VALUES
--   ('Test User', 'test@example.com', '+1234567890');

-- Insert sample order
-- WITH new_order AS (
--   INSERT INTO orders (user_id, total_amount, status)
--   SELECT id, 99.99, 'completed'
--   FROM users WHERE email = 'test@example.com'
--   RETURNING id
-- )
-- INSERT INTO order_items (order_id, item_name, price, quantity, subtotal)
-- SELECT id, 'Sample Product', 49.99, 2, 99.98
-- FROM new_order;

-- =====================================================
-- GRANTS - Ensure proper permissions
-- =====================================================

-- Grant permissions to authenticated users (if using RLS)
-- GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
-- GRANT SELECT, INSERT ON order_items TO authenticated;

-- Grant permissions to service role (used by Netlify Functions)
GRANT ALL ON users TO service_role;
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_items TO service_role;
GRANT SELECT ON order_details TO service_role;

-- =====================================================
-- CLEANUP FUNCTIONS (Optional)
-- =====================================================

-- Function: Delete old test orders (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_test_orders()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM orders
  WHERE status = 'pending'
    AND order_date < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- To run cleanup manually:
-- SELECT cleanup_old_test_orders();

-- To schedule automatic cleanup (requires pg_cron extension):
-- SELECT cron.schedule('cleanup-old-orders', '0 2 * * *', 'SELECT cleanup_old_test_orders()');

-- =====================================================
-- COMMENTS - Document the schema
-- =====================================================

COMMENT ON TABLE users IS 'Stores customer information';
COMMENT ON TABLE orders IS 'Stores order headers with total amount and status';
COMMENT ON TABLE order_items IS 'Stores individual items for each order';
COMMENT ON VIEW order_details IS 'Complete order information with user details';
COMMENT ON FUNCTION calculate_order_total IS 'Calculate total amount for an order from its items';
COMMENT ON FUNCTION get_user_order_count IS 'Get total number of orders for a user';
COMMENT ON FUNCTION get_user_total_spent IS 'Get total amount spent by a user (completed orders only)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Verify indexes exist
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- Check table sizes
-- SELECT
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
