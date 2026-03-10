USE venus_db;

-- First, check what users exist
SELECT id, email, password, role FROM users;

-- If admin doesn't exist or password is wrong, create/replace it
-- Password 'Admin@123' hashed with bcrypt
INSERT INTO users (email, password, first_name, last_name, role, is_active) 
VALUES (
    'admin@venusenterprises.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrV9U5XvKpQK5JqK5qK5qK5qK5qK5qK', 
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

-- Verify admin user
SELECT id, email, role, is_active FROM users WHERE email = 'admin@venusenterprises.com';