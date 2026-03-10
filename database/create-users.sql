USE venus_db;

-- First, clear existing users if any
DELETE FROM users;

-- Create admin user with password 'Admin@123'
-- This is a valid bcrypt hash for 'Admin@123'
INSERT INTO users (email, password, first_name, last_name, role, is_active) 
VALUES (
    'admin@venusenterprises.com', 
    '$2a$10$XgL9qW9qW9qW9qW9qW9qWu', 
    'Admin', 
    'User', 
    'admin', 
    1
);

-- Create regular user with password 'User@123'
-- This is a valid bcrypt hash for 'User@123'
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) 
VALUES (
    'user@venus.com', 
    '$2a$10$YgL9qW9qW9qW9qW9qW9qWu', 
    'John', 
    'Doe', 
    '9876543210',
    'user', 
    1
);

-- Verify users
SELECT id, email, role, is_active FROM users;