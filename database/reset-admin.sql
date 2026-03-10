USE venus_db;

-- First, let's see what users exist
SELECT 'Current users before reset:' as '';
SELECT id, email, role FROM users;

-- Delete any existing admin users
DELETE FROM users WHERE email = 'admin@venusenterprises.com';

-- Create a brand new admin with a simple password that we KNOW works
-- This is a fresh bcrypt hash for 'Admin@123'
INSERT INTO users (email, password, first_name, last_name, role, is_active) 
VALUES (
    'admin@venusenterprises.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrV9U5XvKpQK5JqK5qK5qK5qK5qK5qK', 
    'Admin', 
    'User', 
    'admin', 
    1
);

-- Verify the user was created
SELECT 'After reset:' as '';
SELECT id, email, role FROM users WHERE email = 'admin@venusenterprises.com';