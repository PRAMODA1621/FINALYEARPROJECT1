-- Drop and recreate database
DROP DATABASE IF EXISTS venus_db;
CREATE DATABASE venus_db;
USE venus_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, description, category, price, stock, image_url, is_featured) VALUES
('Smartphone X', 'Latest smartphone with 6.7" display, 128GB storage, 5G capable', 'Electronics', 799.99, 50, '/images/products/smartphone-x.jpg', TRUE),
('Laptop Pro', '15" laptop with 16GB RAM, 512GB SSD, Intel i7 processor', 'Electronics', 1299.99, 30, '/images/products/laptop-pro.jpg', TRUE),
('Wireless Headphones', 'Noise-cancelling wireless headphones with 30hr battery', 'Electronics', 199.99, 100, '/images/products/headphones.jpg', FALSE),
('Men\'s T-Shirt', 'Cotton casual t-shirt, available in multiple colors', 'Clothing', 24.99, 200, '/images/products/tshirt.jpg', FALSE),
('Women\'s Jeans', 'Slim fit jeans, stretchable fabric', 'Clothing', 49.99, 150, '/images/products/jeans.jpg', FALSE),
('Coffee Maker', 'Programmable coffee maker with 12-cup capacity', 'Home & Garden', 89.99, 75, '/images/products/coffee-maker.jpg', TRUE),
('Yoga Mat', 'Non-slip exercise mat with carrying strap', 'Sports & Outdoors', 29.99, 120, '/images/products/yoga-mat.jpg', FALSE),
('Running Shoes', 'Lightweight running shoes with cushioning', 'Sports & Outdoors', 79.99, 80, '/images/products/running-shoes.jpg', TRUE);

-- Customization options table
CREATE TABLE customization_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    option_type ENUM('text', 'color', 'image', 'select') NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    option_values JSON,
    additional_price DECIMAL(10, 2) DEFAULT 0.00,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Cart table
CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_cart (user_id)
);

-- Cart items table
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    customization_data JSON,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_method ENUM('upi', 'cod') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    customization_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Wishlist table
CREATE TABLE wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Create default admin user (password: Admin@123)
INSERT INTO users (email, password, first_name, last_name, role, is_active) 
VALUES ('admin@venus.com', '$2a$10$XgL9qW9qW9qW9qW9qW9qWu', 'Admin', 'User', 'admin', TRUE);

-- Create sample user (password: User@123)
INSERT INTO users (email, password, first_name, last_name, phone, address, city, state, zip_code, role) 
VALUES ('user@example.com', '$2a$10$YgL9qW9qW9qW9qW9qW9qWu', 'John', 'Doe', '555-1234', '123 Main St', 'Anytown', 'CA', '12345', 'user');

COMMIT;