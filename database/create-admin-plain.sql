USE venus_db;

-- First, let's see what users exist
SELECT 'Current users in database:' as '';
SELECT id, email, role FROM users;

-- Create or update admin with plain text password
INSERT INTO users (email, password, first_name, last_name, role, is_active) 
VALUES (
    'admin@venusenterprises.com', 
    'Admin@123', 
    'Admin', 
    'User', 
    'admin', 
    1
) ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    role = VALUES(role),
    is_active = VALUES(is_active);

-- Create or update regular user
INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) 
VALUES (
    'user@venus.com', 
    'User@123', 
    'John', 
    'Doe', 
    '9876543210',
    'user', 
    1
) ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    phone = VALUES(phone),
    role = VALUES(role),
    is_active = VALUES(is_active);

-- Verify updated users
SELECT 'Updated users:' as '';
SELECT id, email, password, role FROM users;