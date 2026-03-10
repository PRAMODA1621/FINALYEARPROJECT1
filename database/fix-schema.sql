-- Venus Enterprises - Complete Database Reset
USE venus_db;

-- Drop existing tables in correct order
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS customization_options;
DROP TABLE IF EXISTS product_features;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS helpdesk_tickets;
DROP TABLE IF EXISTS ticket_responses;
DROP TABLE IF EXISTS faqs;

-- Products table with correct categories
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('Wooden', 'Acrylic', 'Metal', 'Crystal', 'Corporate Gifts') NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

-- Insert correct Venus Enterprises products
INSERT INTO products (name, description, category, price, stock, image_url, is_featured) VALUES
('Engraved Wooden Name Plate', 'Premium teak wood name plate with laser engraving. Perfect for office desks and executive cabins. Features durable finish and elegant design. Customize with name, designation, and company logo. Each piece is hand-finished by skilled artisans.', 'Wooden', 1299.00, 85, '/src/assets/images/wooden/wooden-nameplate.jpg', TRUE),
('Acrylic LED Name Plate', 'Modern acrylic name plate with energy-efficient LED backlighting. Creates stunning visual impact in any corporate setting. Touch-sensitive on/off switch. Available in multiple colors with custom engraving.', 'Acrylic', 1899.00, 45, '/src/assets/images/acrylic/acrylic-led-nameplate.jpg', TRUE),
('Crystal Corporate Award', 'Premium crystal award trophy for recognition ceremonies. Made from optical crystal with laser engraved text. Includes elegant wooden base and premium gift box. Perfect for employee of the month, years of service, and achievement awards.', 'Crystal', 2499.00, 35, '/src/assets/images/crystal/crystal-award.jpg', TRUE),
('Metal Engraved Pen', 'Stainless steel executive pen with precision laser engraving. Smooth ink flow and premium metal finish. Comes in gift box with engraving service. Ideal for corporate gifting and promotional events.', 'Metal', 799.00, 120, '/src/assets/images/metal/engraved-pen.jpg', TRUE),
('Corporate Gift Combo', 'Complete corporate gifting solution including engraved metal pen, premium leather diary, and custom metal keychain. Packaged in elegant branded box. Perfect for client appreciation and employee recognition.', 'Corporate Gifts', 2999.00, 40, '/src/assets/images/corporate/gift-combo.jpg', TRUE),
('Wooden Photo Frame Plaque', 'Handcrafted wooden photo frame with engraved message. Perfect for farewell gifts, retirement parties, and employee recognition. Available in multiple wood finishes with custom text engraving.', 'Wooden', 1499.00, 60, '/src/assets/images/wooden/photo-frame.jpg', FALSE),
('Acrylic Trophy Award', 'Modern acrylic trophy for sports events and corporate competitions. Clear acrylic with colored base. Custom engraving available for winner names and event details. Lightweight yet durable design.', 'Acrylic', 1799.00, 50, '/src/assets/images/acrylic/trophy.jpg', TRUE),
('Metal Keychain', 'Stainless steel keychain perfect for corporate giveaways and promotional events. Laser engraving compatible with company logos and messages. Rust resistant and lightweight design.', 'Metal', 399.00, 200, '/src/assets/images/metal/keychain.jpg', FALSE),
('Customized Coffee Mug', 'Premium ceramic coffee mug with full-color logo printing. Dishwasher safe and microwave safe. Ideal for promotional events, employee gifts, and client appreciation. Available in multiple colors.', 'Corporate Gifts', 349.00, 150, '/src/assets/images/corporate/coffee-mug.jpg', FALSE),
('Corporate Desk Clock', 'Elegant desk clock with brushed metal frame and silent quartz movement. Features engraving plate for personalized messages. Perfect for executive gifts, retirement presents, and corporate milestones.', 'Metal', 1899.00, 45, '/src/assets/images/metal/desk-clock.jpg', TRUE);

-- Insert product features
INSERT INTO product_features (product_id, feature, display_order) VALUES
(1, 'Premium teak wood construction', 1),
(1, 'Laser engraving technology', 2),
(1, 'Durable protective finish', 3),
(1, 'Multiple font styles available', 4),
(1, 'Custom logo engraving option', 5),
(2, 'Energy-efficient LED backlighting', 1),
(2, 'Touch-sensitive on/off switch', 2),
(2, 'High-quality acrylic material', 3),
(2, 'Available in 5 LED colors', 4),
(2, 'Custom text engraving', 5),
(3, 'Optical crystal construction', 1),
(3, 'Laser engraved nameplate', 2),
(3, 'Elegant wooden display base', 3),
(3, 'Premium gift box included', 4),
(3, 'Custom award messages', 5),
(4, 'Stainless steel construction', 1),
(4, 'Precision laser engraving', 2),
(4, 'Smooth ink flow system', 3),
(4, 'Refillable ink cartridge', 4),
(4, 'Gift box packaging', 5),
(5, 'Premium leather diary', 1),
(5, 'Engraved metal pen', 2),
(5, 'Custom metal keychain', 3),
(5, 'Branded gift box', 4),
(5, 'Custom company logo', 5),
(6, 'Handcrafted wood frame', 1),
(6, 'Custom engraved message', 2),
(6, 'Multiple wood finishes', 3),
(6, 'Standard photo size 6x4', 4),
(6, 'Tabletop display stand', 5),
(7, 'Clear acrylic construction', 1),
(7, 'Colored acrylic base', 2),
(7, 'Custom winner engraving', 3),
(7, 'Lightweight design', 4),
(7, 'Scratch-resistant surface', 5),
(8, 'Stainless steel material', 1),
(8, 'Laser engraving compatible', 2),
(8, 'Rust-resistant finish', 3),
(8, 'Lightweight design', 4),
(8, 'Split ring attachment', 5),
(9, 'Premium ceramic material', 1),
(9, 'Full-color logo printing', 2),
(9, 'Dishwasher safe', 3),
(9, 'Microwave safe', 4),
(9, '11 oz standard size', 5),
(10, 'Brushed metal frame', 1),
(10, 'Silent quartz movement', 2),
(10, 'Engraving plate included', 3),
(10, 'Protective glass lens', 4),
(10, 'Requires 1x AA battery', 5);

-- Insert customization options
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(1, 'text', 'Name to Engrave', '{"maxLength": 40, "placeholder": "Enter name and title"}', 0.00, TRUE),
(1, 'text', 'Designation', '{"maxLength": 50, "placeholder": "Enter designation"}', 0.00, FALSE),
(1, 'font', 'Font Style', '["Classic", "Modern", "Elegant", "Bold"]', 0.00, FALSE),
(1, 'color', 'Wood Finish', '["Natural", "Dark Walnut", "Mahogany", "Oak"]', 0.00, TRUE),
(2, 'text', 'Name to Display', '{"maxLength": 30, "placeholder": "Enter name"}', 0.00, TRUE),
(2, 'color', 'LED Color', '["White", "Blue", "Red", "Green", "RGB Color Cycle"]', 199.00, FALSE),
(2, 'font', 'Font Style', '["Classic", "Modern"]', 0.00, FALSE),
(3, 'text', 'Award Text', '{"maxLength": 60, "placeholder": "Enter award message"}', 0.00, TRUE),
(3, 'text', 'Recipient Name', '{"maxLength": 40, "placeholder": "Enter recipient name"}', 0.00, TRUE),
(3, 'font', 'Font Style', '["Classic", "Elegant"]', 0.00, FALSE),
(4, 'text', 'Engraved Text', '{"maxLength": 30, "placeholder": "Enter text"}', 0.00, TRUE),
(4, 'color', 'Pen Color', '["Silver", "Gold", "Black", "Rose Gold"]', 0.00, TRUE),
(4, 'font', 'Font Style', '["Classic", "Modern", "Script"]', 0.00, FALSE),
(5, 'text', 'Company Name', '{"maxLength": 50, "placeholder": "Enter company name"}', 0.00, TRUE),
(5, 'text', 'Recipient Name', '{"maxLength": 40, "placeholder": "Enter recipient name"}', 0.00, TRUE),
(5, 'image', 'Upload Logo', '{"maxSize": "5MB", "formats": ["jpg", "png", "svg"]}', 299.00, FALSE),
(6, 'text', 'Engraved Message', '{"maxLength": 100, "placeholder": "Enter message"}', 0.00, TRUE),
(6, 'color', 'Frame Color', '["Natural", "Dark Walnut", "Mahogany"]', 0.00, TRUE),
(7, 'text', 'Winner Name', '{"maxLength": 40, "placeholder": "Enter winner name"}', 0.00, TRUE),
(7, 'text', 'Event Details', '{"maxLength": 60, "placeholder": "Enter event details"}', 0.00, TRUE),
(8, 'text', 'Engraved Text', '{"maxLength": 20, "placeholder": "Enter text"}', 0.00, TRUE),
(8, 'font', 'Font Style', '["Classic", "Minimal"]', 0.00, FALSE),
(9, 'text', 'Custom Text', '{"maxLength": 30, "placeholder": "Enter text"}', 0.00, TRUE),
(9, 'image', 'Upload Logo', '{"maxSize": "5MB", "formats": ["jpg", "png"]}', 99.00, FALSE),
(9, 'color', 'Mug Color', '["White", "Black", "Navy", "Red"]', 0.00, TRUE),
(10, 'text', 'Engraved Message', '{"maxLength": 40, "placeholder": "Enter message"}', 0.00, TRUE),
(10, 'font', 'Font Style', '["Classic", "Elegant"]', 0.00, FALSE);

-- Insert testimonials
INSERT INTO testimonials (customer_name, customer_location, content, rating) VALUES
('Rajesh Kumar', 'Mumbai', 'The crystal awards we ordered for our annual conference were absolutely stunning. The engraving quality is exceptional and our employees loved them. Will definitely order again!', 5),
('Priya Sharma', 'Delhi', 'Venus Enterprises provided excellent corporate gifts for our client appreciation event. The engraved pens and leather diaries were a huge hit. Packaging was premium.', 5),
('Amit Patel', 'Bangalore', 'The custom engraved wooden name plates look fantastic in our new office. Professional quality and timely delivery. Highly recommended for corporate needs.', 5),
('Neha Gupta', 'Pune', 'Ordered 50 gift combos for employee appreciation. Everyone loved the packaging and customization options. Great value for money.', 5),
('Vikram Singh', 'Chennai', 'The acrylic LED name plates are stunning! Modern look and excellent build quality. Our executives love them.', 5);

-- Insert FAQs
INSERT INTO faqs (question, answer, category, display_order) VALUES
('How do I track my order?', 'You can track your order by logging into your account and visiting the Order History section. You will also receive email updates with tracking information once your order ships.', 'Orders', 1),
('What is your customization process?', 'After you place an order with customization, our design team will review your requirements and send a digital proof within 24-48 hours. Production begins after you approve the design.', 'Customization', 2),
('How long does engraving take?', 'Standard engraving takes 3-5 business days. Complex designs or bulk orders may take 5-7 business days. We\'ll provide an estimated timeline after order confirmation.', 'Customization', 3),
('What is your return policy?', 'We offer 30-day returns for unused items in original packaging. Customized items cannot be returned unless there is a manufacturing defect. Please contact our support team for assistance.', 'Returns', 4),
('Do you ship internationally?', 'Yes, we ship to most countries worldwide. International shipping costs vary by location and will be calculated at checkout. Delivery times range from 7-14 business days.', 'Shipping', 5),
('Can I order a sample before bulk order?', 'Yes, we offer sample orders for bulk corporate gifting. Please contact our sales team at sales@venus.com for sample requests and bulk pricing.', 'Corporate', 6);

-- Create default admin user (password: Admin@123)
INSERT INTO users (email, password, first_name, last_name, role, is_active) 
VALUES ('admin@venus.com', '$2a$10$XgL9qW9qW9qW9qW9qW9qWu', 'Admin', 'User', 'admin', TRUE)
ON DUPLICATE KEY UPDATE email = email;

-- Create sample user (password: User@123)
INSERT INTO users (email, password, first_name, last_name, phone, address, city, state, zip_code, role) 
VALUES ('user@venus.com', '$2a$10$YgL9qW9qW9qW9qW9qW9qWu', 'John', 'Doe', '9876543210', '123 Business Park', 'Mumbai', 'Maharashtra', '400001', 'user')
ON DUPLICATE KEY UPDATE email = email;

COMMIT;