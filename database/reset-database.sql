-- Complete database reset and seed
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

-- Product features table
CREATE TABLE product_features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    feature TEXT NOT NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product images table
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Customization options table
CREATE TABLE customization_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    option_type ENUM('text', 'font', 'color', 'image') NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    option_values JSON,
    additional_price DECIMAL(10, 2) DEFAULT 0.00,
    is_required BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Testimonials table
CREATE TABLE testimonials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    customer_location VARCHAR(100),
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Helpdesk tickets table
CREATE TABLE helpdesk_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    category VARCHAR(100),
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Ticket responses table
CREATE TABLE ticket_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_staff_response BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- FAQs table
CREATE TABLE faqs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert products
INSERT INTO products (name, description, category, price, stock, image_url, is_featured) VALUES
('Premium Engraved Metal Pen', 'Elegant stainless steel engraved pen designed for corporate gifting and executive use.', 'Corporate Gifts', 799.00, 120, 'https://images.unsplash.com/photo-1583485088034-6e7a9d9d7f3c?w=500', TRUE),
('Crystal Corporate Award', 'Premium crystal award trophy perfect for corporate recognition ceremonies.', 'Awards', 2499.00, 60, 'https://images.unsplash.com/photo-1598257006458-0871690d0f3b?w=500', TRUE),
('Engraved Wooden Name Plate', 'Custom engraved wooden name plate suitable for office desks and doors.', 'Office Decor', 1299.00, 90, 'https://images.unsplash.com/photo-1586075010923-9dd4572fb6bf?w=500', TRUE),
('Custom Photo Frame Plaque', 'Personalized photo frame plaque ideal for corporate gifting and memories.', 'Personalized Gifts', 1499.00, 75, 'https://images.unsplash.com/photo-1513519245088-0e12902b535c?w=500', FALSE),
('Corporate Gift Combo Kit', 'Professional corporate gift combo including pen, diary, and keychain.', 'Corporate Gifts', 2999.00, 40, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500', TRUE),
('Leather Executive Diary', 'Premium leather diary for professionals and executives.', 'Office Essentials', 999.00, 110, 'https://images.unsplash.com/photo-1544816155-12c964d8b5a1?w=500', FALSE),
('Stainless Steel Keychain', 'Minimal stainless steel keychain perfect for engraving names.', 'Accessories', 399.00, 200, 'https://images.unsplash.com/photo-1606041008023-472df0ac6b3c?w=500', FALSE),
('Engraved Corporate Desk Clock', 'Elegant desk clock suitable for corporate gifting.', 'Office Decor', 1899.00, 55, 'https://images.unsplash.com/photo-1563863251021-32b9d6a7d9b1?w=500', TRUE),
('Promotional Coffee Mug', 'Ceramic promotional mug ideal for branding and giveaways.', 'Promotional Products', 349.00, 250, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500', FALSE),
('Custom Engraved Glass Plaque', 'Professional glass plaque for awards and recognition events.', 'Awards', 1799.00, 70, 'https://images.unsplash.com/photo-1574267432553-4b8c6e3d3f3c?w=500', TRUE);

-- Insert product features
INSERT INTO product_features (product_id, feature, display_order) VALUES
(1, 'Laser engraving support', 1),
(1, 'Premium metal finish', 2),
(1, 'Smooth ink flow', 3),
(2, 'Optical crystal', 1),
(2, 'Laser engraved nameplate', 2),
(2, 'Elegant base stand', 3),
(3, 'Premium teak wood', 1),
(3, 'Laser engraving', 2),
(3, 'Durable finish', 3);

-- Insert customization options
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(1, 'text', 'Engraved Text', '{"maxLength": 30, "placeholder": "Enter text to engrave"}', 0.00, TRUE),
(1, 'color', 'Pen Color', '["Silver", "Gold", "Black", "Rose Gold"]', 0.00, TRUE),
(3, 'text', 'Name Text', '{"maxLength": 40, "placeholder": "Enter name/title"}', 0.00, TRUE),
(3, 'color', 'Wood Finish', '["Natural", "Dark Walnut", "Mahogany", "Oak"]', 0.00, TRUE);

-- Insert testimonials
INSERT INTO testimonials (customer_name, customer_location, content, rating, image_url) VALUES
('Rajesh Kumar', 'Mumbai', 'The crystal awards we ordered were absolutely stunning. The engraving quality is exceptional and our employees loved them.', 5, NULL),
('Priya Sharma', 'Delhi', 'Venus Enterprises provided excellent corporate gifts for our annual conference. The premium metal pens were a huge hit!', 5, NULL),
('Amit Patel', 'Bangalore', 'The custom engraved name plates look fantastic in our office. Professional quality and timely delivery.', 4, NULL),
('Neha Gupta', 'Pune', 'Ordered 50 gift combos for employee appreciation. Everyone loved the packaging and customization options.', 5, NULL);

-- Insert FAQs
INSERT INTO faqs (question, answer, category, display_order) VALUES
('How do I track my order?', 'You can track your order by logging into your account and visiting the Order History section.', 'Orders', 1),
('What is your return policy?', 'We offer 30-day returns for all unused items in original packaging.', 'Returns', 2),
('Do you ship internationally?', 'Yes, we ship to most countries worldwide. Shipping costs apply.', 'Shipping', 3),
('How can I contact customer support?', 'You can create a support ticket through our Helpdesk or email us at support@venus.com.', 'Support', 4);

-- Create users (passwords: Admin@123, User@123)
INSERT INTO users (email, password, first_name, last_name, role, is_active) 
VALUES ('admin@venus.com', '$2a$10$XgL9qW9qW9qW9qW9qW9qWu', 'Admin', 'User', 'admin', TRUE);

INSERT INTO users (email, password, first_name, last_name, phone, address, city, state, zip_code, role) 
VALUES ('user@venus.com', '$2a$10$YgL9qW9qW9qW9qW9qW9qWu', 'John', 'Doe', '555-1234', '123 Main St', 'Anytown', 'CA', '12345', 'user');

COMMIT;