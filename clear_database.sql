-- Clear Database Script for Testing
-- Run these commands in Supabase SQL Editor in this exact order

-- 1. Clear all transactions first (removes foreign key dependencies)
TRUNCATE TABLE transactions CASCADE;

-- 2. Clear all balances
TRUNCATE TABLE balances CASCADE;

-- 3. Clear all cafe-related tables if they exist
TRUNCATE TABLE cafe_transactions CASCADE;
TRUNCATE TABLE cafe_items CASCADE;

-- 4. Now clear items table
TRUNCATE TABLE items CASCADE;

-- 5. Reset auto-increment sequences (optional)
ALTER SEQUENCE items_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE balances_id_seq RESTART WITH 1;

-- Verify all tables are empty
SELECT 'items' as table_name, COUNT(*) as row_count FROM items
UNION ALL
SELECT 'transactions' as table_name, COUNT(*) as row_count FROM transactions
UNION ALL
SELECT 'balances' as table_name, COUNT(*) as row_count FROM balances;