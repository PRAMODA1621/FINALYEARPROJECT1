-- Venus Enterprises - Complete Database Schema
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
    country VARCHAR(100) DEFAULT 'India',
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
    category ENUM('Wooden', 'Acrylic', 'Metal', 'Gifts', 'Mementos', 'Marble') NOT NULL,
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
    payment_method ENUM('card', 'upi', 'cod') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    notes TEXT,
    customization_data JSON,
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

-- Testimonials table
CREATE TABLE testimonials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    customer_location VARCHAR(100),
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert products
-- Insert products
INSERT INTO products (name, description, category, price, stock, image_url, is_featured) VALUES

-- Wooden Products
('Engraved Wooden Name Plate', 'Premium teak wood name plate with laser engraving. Perfect for office desks and executive cabins. Customize with name, designation, and company logo. Dimensions: 8" x 3". Comes with desk stand.', 'Wooden', 1299.00, 85, '/images/wooden/wooden-name-plate.jpg', 1),

('Wooden Photo Frame Plaque', 'Handcrafted wooden photo frame with engraved message. Perfect for farewell gifts and employee recognition. Holds 6" x 4" photo. Available in natural, walnut, and mahogany finishes.', 'Wooden', 1499.00, 60, '/images/wooden/photo-frame.jpg', 0),

('Wooden Business Card Holder', 'Handcrafted wooden business card holder with engraved company logo. Holds 20-25 cards. Perfect for executive desks and reception areas. Non-slip felt base.', 'Wooden', 899.00, 75, '/images/wooden/card-holder.jpg', 0),

('Wooden Pen Stand', 'Elegant wooden pen stand with laser engraved base. Holds 6-8 pens. Perfect for office desks. Available in multiple wood finishes.', 'Wooden', 699.00, 100, '/images/wooden/pen-stand.jpg', 0),

('Wooden Award Plaque', 'Premium wooden award plaque with metal inscription plate. Ideal for employee of the month, service awards, and recognition ceremonies. Includes wall mounting hardware.', 'Wooden', 1999.00, 40, '/images/wooden/award-plaque.jpg', 1),

-- Acrylic Products
('Acrylic LED Name Plate', 'Modern acrylic name plate with energy-efficient LED backlighting. Touch-sensitive on/off switch. Available in white, blue, and RGB colors. USB powered.', 'Acrylic', 1899.00, 45, '/images/acrylic/led-nameplate.jpg', 1),

('Acrylic Trophy Award', 'Modern acrylic trophy for corporate competitions. Clear acrylic with colored base. Custom engraving available for winner names and event details. Height: 10".', 'Acrylic', 1799.00, 50, '/images/acrylic/trophy.jpg', 1),

('Acrylic Paper Weight', 'Clear acrylic paper weight with 3D laser engraved logo inside. Modern and elegant design for office desks. Size: 3" x 3".', 'Acrylic', 599.00, 100, '/images/acrylic/paper-weight.jpg', 0),

('Acrylic Plaque', 'Crystal clear acrylic plaque with engraved text. Perfect for service awards, recognition, and achievement celebrations. Includes display stand.', 'Acrylic', 1299.00, 65, '/images/acrylic/plaque.jpg', 0),

('Acrylic Desk Sign', 'Elegant acrylic desk sign with custom engraved text. Ideal for reception areas, executive offices, and conference rooms. Double-sided printing available.', 'Acrylic', 999.00, 80, '/images/acrylic/desk-sign.jpg', 0),

-- Metal Products
('Metal Engraved Pen', 'Stainless steel executive pen with precision laser engraving. Smooth ink flow and premium metal finish. Comes in gift box with engraving service. Refillable.', 'Metal', 799.00, 120, '/images/metal/engraved-pen.jpg', 1),

('Metal Keychain', 'Stainless steel keychain with laser engraving. Perfect for corporate giveaways and promotional events. Rust resistant and lightweight design. Size: 1.5" diameter.', 'Metal', 399.00, 200, '/images/metal/keychain.jpg', 0),

('Corporate Desk Clock', 'Elegant desk clock with brushed metal frame and silent quartz movement. Features engraving plate for personalized messages. Requires 1 AA battery (not included).', 'Metal', 1899.00, 45, '/images/metal/desk-clock.jpg', 1),

('Metal Business Card Case', 'Premium stainless steel business card case with laser engraved logo. Slim profile fits in pocket. Holds 10-15 cards securely. Magnetic closure.', 'Metal', 699.00, 85, '/images/metal/card-case.jpg', 0),

('Metal Letter Opener', 'Stainless steel letter opener with engraved handle. Classic corporate gift for executives and clients. Sharp blade with safety tip. Length: 8".', 'Metal', 499.00, 150, '/images/metal/letter-opener.jpg', 0),

-- Gifts
('Corporate Gift Combo', 'Complete corporate gifting solution including engraved metal pen, premium leather diary, and custom metal keychain. Packaged in elegant branded box. Perfect for client appreciation.', 'Gifts', 2999.00, 40, '/images/gifts/gift-combo.jpg', 1),

('Customized Coffee Mug', 'Premium ceramic coffee mug with full-color logo printing. Dishwasher safe and microwave safe. 11 oz capacity. Ideal for promotional events and employee gifts.', 'Gifts', 349.00, 150, '/images/gifts/coffee-mug.jpg', 0),

('Corporate Leather Folder', 'Premium leather folder with engraved metal name plate. Includes padfolio and business card holder. Perfect for client meetings and presentations.', 'Gifts', 2199.00, 35, '/images/gifts/leather-folder.jpg', 1),

('Executive Gift Set', 'Luxury gift set including metal pen, leather card holder, and engraved keychain. Premium packaging with custom message. Ideal for executive gifting.', 'Gifts', 3599.00, 25, '/images/gifts/executive-set.jpg', 1),

('Leather Mouse Pad', 'Premium leather mouse pad with stitched edges and engraved logo. Non-slip backing. Perfect executive desk accessory. Size: 9" x 8".', 'Gifts', 799.00, 80, '/images/gifts/mouse-pad.jpg', 0),

-- Mementos
('Memento of Gratitude', 'Beautiful memento to express gratitude and appreciation. Custom engraved message on crystal-clear acrylic. Includes display stand. Size: 6" x 4".', 'Mementos', 1499.00, 65, '/images/mementos/gratitude.jpg', 0),

('Memento of Service', 'Elegant memento for years of service recognition. Laser engraved on polished crystal. Features company logo and years of service. Includes presentation box.', 'Mementos', 1899.00, 40, '/images/mementos/service.jpg', 1),

-- Marble
('Marble Base Award', 'Elegant marble base award with metal plate. Perfect for lifetime achievement, hall of fame, and special recognition. Heavy marble base ensures stability. Plate size: 4" x 2".', 'Marble', 3999.00, 20, '/images/marble/marble-award.jpg', 1),

('Marble Paperweight', 'Elegant marble paperweight with engraved metal plate. Classic desk accessory. Available in white, green, and black marble. Size: 3" diameter.', 'Marble', 1299.00, 40, '/images/marble/paperweight.jpg', 0),

('Marble Plaque', 'Premium marble plaque with metal inscription. Perfect for corporate awards, commemorative plaques, and recognition. Includes wall mounting hardware.', 'Marble', 3299.00, 25, '/images/marble/plaque.jpg', 1);
-- Insert product features
INSERT INTO product_features (product_id, feature, display_order) VALUES
(1, 'Premium teak wood construction', 1),
(1, 'Laser engraving technology', 2),
(1, 'Durable protective finish', 3),
(1, 'Multiple font styles available', 4),
(1, 'Custom logo engraving option', 5),
(6, 'Energy-efficient LED backlighting', 1),
(6, 'Touch-sensitive on/off switch', 2),
(6, 'High-quality acrylic material', 3),
(6, 'Available in 5 LED colors', 4),
(11, 'Stainless steel construction', 1),
(11, 'Precision laser engraving', 2),
(11, 'Smooth ink flow system', 3),
(11, 'Refillable ink cartridge', 4),
(16, 'Premium leather diary', 1),
(16, 'Engraved metal pen', 2),
(16, 'Custom metal keychain', 3),
(16, 'Branded gift box', 4),
(21, 'Crystal-clear acrylic', 1),
(21, 'Laser engraved message', 2),
(21, 'Elegant display stand', 3),
(23, 'Premium marble construction', 1),
(23, 'Metal inscription plate', 2),
(23, 'Heavy-duty base', 3);

-- Insert customization options
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(1, 'text', 'Name to Engrave', '{"maxLength": 40, "placeholder": "Enter name and title"}', 0.00, 1),
(1, 'text', 'Designation', '{"maxLength": 50, "placeholder": "Enter designation"}', 0.00, 0),
(1, 'font', 'Font Style', '["Classic", "Modern", "Elegant", "Bold"]', 0.00, 0),
(1, 'color', 'Wood Finish', '["Natural", "Dark Walnut", "Mahogany", "Oak"]', 0.00, 1),
(6, 'text', 'Name to Display', '{"maxLength": 30, "placeholder": "Enter name"}', 0.00, 1),
(6, 'color', 'LED Color', '["White", "Blue", "Red", "Green", "RGB"]', 199.00, 0),
(11, 'text', 'Engraved Text', '{"maxLength": 30, "placeholder": "Enter text"}', 0.00, 1),
(11, 'color', 'Pen Color', '["Silver", "Gold", "Black", "Rose Gold"]', 0.00, 1),
(16, 'text', 'Company Name', '{"maxLength": 50, "placeholder": "Enter company name"}', 0.00, 1),
(16, 'text', 'Recipient Name', '{"maxLength": 40, "placeholder": "Enter recipient name"}', 0.00, 1),
(16, 'image', 'Upload Logo', '{"maxSize": "5MB", "formats": ["jpg", "png", "svg"]}', 299.00, 0),
(21, 'text', 'Engraved Message', '{"maxLength": 100, "placeholder": "Enter message"}', 0.00, 1),
(23, 'text', 'Award Text', '{"maxLength": 60, "placeholder": "Enter award text"}', 0.00, 1),
(23, 'text', 'Recipient Name', '{"maxLength": 40, "placeholder": "Enter recipient name"}', 0.00, 1);

-- Insert testimonials
INSERT INTO testimonials (customer_name, customer_location, content, rating) VALUES
('Rajesh Kumar', 'Mumbai', 'The crystal awards we ordered for our annual conference were absolutely stunning. The engraving quality is exceptional and our employees loved them.', 5),
('Priya Sharma', 'Delhi', 'Venus Enterprises provided excellent corporate gifts for our client appreciation event. The engraved pens were a huge hit!', 5),
('Amit Patel', 'Bangalore', 'The custom engraved wooden name plates look fantastic in our new office. Professional quality and timely delivery.', 5),
('Neha Gupta', 'Pune', 'Ordered 50 gift combos for employee appreciation. Everyone loved the packaging and customization options.', 5),
('Vikram Singh', 'Chennai', 'The acrylic LED name plates are stunning! Modern look and excellent build quality. Our executives love them.', 5);

-- Create users (passwords: Admin@123, User@123)
INSERT INTO users (email, password, first_name, last_name, role, is_active) 
VALUES ('admin@venusenterprises.com', '$2a$10$XgL9qW9qW9qW9qW9qW9qWu', 'Admin', 'User', 'admin', 1);

INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) 
VALUES ('user@venus.com', '$2a$10$YgL9qW9qW9qW9qW9qW9qWu', 'John', 'Doe', '9876543210', 'user', 1);

COMMIT;