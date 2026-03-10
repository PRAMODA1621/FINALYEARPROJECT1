-- Database initialization script
CREATE DATABASE IF NOT EXISTS venus_db;
USE venus_db;

-- Source schema and seed
SOURCE database/schema.sql;
SOURCE database/seed.sql;

-- Create database user
CREATE USER IF NOT EXISTS 'venus_user'@'%' IDENTIFIED BY 'Venus@2024';
GRANT ALL PRIVILEGES ON venus_db.* TO 'venus_user'@'%';
FLUSH PRIVILEGES;

COMMIT;