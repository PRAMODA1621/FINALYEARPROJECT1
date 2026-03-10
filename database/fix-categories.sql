-- Venus Enterprises - Fix Categories
USE venus_db;

-- Drop and recreate products table with correct categories
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS customization_options;
DROP TABLE IF EXISTS product_features;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;

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

-- Insert Venus Enterprises products with correct categories
INSERT INTO products (name, description, category, price, stock, image_url, is_featured) VALUES
('Engraved Wooden Name Plate', 'Premium teak wood name plate with laser engraving. Perfect for office desks and executive cabins. Features durable finish and elegant design. Customize with name, designation, and company logo.', 'Wooden', 1299.00, 85, '/src/assets/images/wooden/wooden-nameplate.jpg', TRUE),
('Acrylic LED Name Plate', 'Modern acrylic name plate with energy-efficient LED backlighting. Creates stunning visual impact in any corporate setting. Touch-sensitive on/off switch. Available in multiple colors with custom engraving.', 'Acrylic', 1899.00, 45, '/src/assets/images/acrylic/acrylic-led-nameplate.jpg', TRUE),
('Crystal Corporate Award', 'Premium crystal award trophy for recognition ceremonies. Made from optical crystal with laser engraved text. Includes elegant wooden base and premium gift box.', 'Crystal', 2499.00, 35, '/src/assets/images/crystal/crystal-award.jpg', TRUE),
('Metal Engraved Pen', 'Stainless steel executive pen with precision laser engraving. Smooth ink flow and premium metal finish. Comes in gift box with engraving service.', 'Metal', 799.00, 120, '/src/assets/images/metal/engraved-pen.jpg', TRUE),
('Corporate Gift Combo', 'Complete corporate gifting solution including engraved metal pen, premium leather diary, and custom metal keychain. Packaged in elegant branded box.', 'Corporate Gifts', 2999.00, 40, '/src/assets/images/corporate/gift-combo.jpg', TRUE),
('Wooden Photo Frame Plaque', 'Handcrafted wooden photo frame with engraved message. Perfect for farewell gifts, retirement parties, and employee recognition. Available in multiple wood finishes.', 'Wooden', 1499.00, 60, '/src/assets/images/wooden/photo-frame.jpg', FALSE),
('Acrylic Trophy Award', 'Modern acrylic trophy for sports events and corporate competitions. Clear acrylic with colored base. Custom engraving available for winner names.', 'Acrylic', 1799.00, 50, '/src/assets/images/acrylic/trophy.jpg', TRUE),
('Metal Keychain', 'Stainless steel keychain perfect for corporate giveaways and promotional events. Laser engraving compatible with company logos and messages.', 'Metal', 399.00, 200, '/src/assets/images/metal/keychain.jpg', FALSE),
('Customized Coffee Mug', 'Premium ceramic coffee mug with full-color logo printing. Dishwasher safe and microwave safe. Ideal for promotional events and employee gifts.', 'Corporate Gifts', 349.00, 150, '/src/assets/images/corporate/coffee-mug.jpg', FALSE),
('Corporate Desk Clock', 'Elegant desk clock with brushed metal frame and silent quartz movement. Features engraving plate for personalized messages. Perfect for executive gifts.', 'Metal', 1899.00, 45, '/src/assets/images/metal/desk-clock.jpg', TRUE),
('Wooden Business Card Holder', 'Handcrafted wooden business card holder with engraved company logo. Perfect for executive desks and reception areas. Holds approximately 20-25 cards.', 'Wooden', 899.00, 75, '/src/assets/images/wooden/card-holder.jpg', FALSE),
('Acrylic Paper Weight', 'Clear acrylic paper weight with 3D laser engraved logo inside. Modern and elegant design for office desks. Makes a great corporate gift.', 'Acrylic', 599.00, 100, '/src/assets/images/acrylic/paper-weight.jpg', FALSE),
('Crystal Paper Weight', 'Optical crystal paper weight with laser engraved message. Classic design perfect for executive gifts and retirement presents.', 'Crystal', 1299.00, 55, '/src/assets/images/crystal/paper-weight.jpg', TRUE),
('Metal Business Card Case', 'Premium stainless steel business card case with laser engraved logo. Slim profile fits in pocket. Holds 10-15 cards.', 'Metal', 699.00, 85, '/src/assets/images/metal/card-case.jpg', FALSE),
('Corporate Leather Folder', 'Premium leather folder with engraved metal name plate. Includes padfolio and business card holder. Perfect for client meetings.', 'Corporate Gifts', 2199.00, 35, '/src/assets/images/corporate/leather-folder.jpg', TRUE);

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
(4, 'Stainless steel construction', 1),
(4, 'Precision laser engraving', 2),
(4, 'Smooth ink flow system', 3),
(4, 'Refillable ink cartridge', 4),
(5, 'Premium leather diary', 1),
(5, 'Engraved metal pen', 2),
(5, 'Custom metal keychain', 3),
(5, 'Branded gift box', 4),
(6, 'Handcrafted wood frame', 1),
(6, 'Custom engraved message', 2),
(6, 'Multiple wood finishes', 3),
(6, 'Standard photo size 6x4', 4),
(7, 'Clear acrylic construction', 1),
(7, 'Colored acrylic base', 2),
(7, 'Custom winner engraving', 3),
(8, 'Stainless steel material', 1),
(8, 'Laser engraving compatible', 2),
(8, 'Rust-resistant finish', 3),
(9, 'Premium ceramic material', 1),
(9, 'Full-color logo printing', 2),
(9, 'Dishwasher safe', 3),
(10, 'Brushed metal frame', 1),
(10, 'Silent quartz movement', 2),
(10, 'Engraving plate included', 3),
(11, 'Solid wood construction', 1),
(11, 'Custom logo engraving', 2),
(11, 'Holds 20-25 cards', 3),
(12, 'Clear acrylic material', 1),
(12, '3D laser engraved logo', 2),
(12, 'Modern geometric design', 3),
(13, 'Optical crystal', 1),
(13, 'Laser engraved message', 2),
(13, 'Classic pyramid shape', 3),
(14, 'Stainless steel', 1),
(14, 'Laser engraved logo', 2),
(14, 'Slim pocket design', 3),
(15, 'Premium leather', 1),
(15, 'Engraved name plate', 2),
(15, 'Includes padfolio', 3);

-- Insert customization options
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(1, 'text', 'Name to Engrave', '{"maxLength": 40, "placeholder": "Enter name and title"}', 0.00, TRUE),
(1, 'text', 'Designation', '{"maxLength": 50, "placeholder": "Enter designation"}', 0.00, FALSE),
(1, 'font', 'Font Style', '["Classic", "Modern", "Elegant", "Bold"]', 0.00, FALSE),
(1, 'color', 'Wood Finish', '["Natural", "Dark Walnut", "Mahogany", "Oak"]', 0.00, TRUE),
(2, 'text', 'Name to Display', '{"maxLength": 30, "placeholder": "Enter name"}', 0.00, TRUE),
(2, 'color', 'LED Color', '["White", "Blue", "Red", "Green", "RGB"]', 199.00, FALSE),
(3, 'text', 'Award Text', '{"maxLength": 60, "placeholder": "Enter award message"}', 0.00, TRUE),
(3, 'text', 'Recipient Name', '{"maxLength": 40, "placeholder": "Enter recipient name"}', 0.00, TRUE),
(4, 'text', 'Engraved Text', '{"maxLength": 30, "placeholder": "Enter text"}', 0.00, TRUE),
(4, 'color', 'Pen Color', '["Silver", "Gold", "Black", "Rose Gold"]', 0.00, TRUE),
(5, 'text', 'Company Name', '{"maxLength": 50, "placeholder": "Enter company name"}', 0.00, TRUE),
(5, 'text', 'Recipient Name', '{"maxLength": 40, "placeholder": "Enter recipient name"}', 0.00, TRUE),
(5, 'image', 'Upload Logo', '{"maxSize": "5MB", "formats": ["jpg", "png", "svg"]}', 299.00, FALSE),
(6, 'text', 'Engraved Message', '{"maxLength": 100, "placeholder": "Enter message"}', 0.00, TRUE),
(6, 'color', 'Frame Color', '["Natural", "Dark Walnut", "Mahogany"]', 0.00, TRUE),
(7, 'text', 'Winner Name', '{"maxLength": 40, "placeholder": "Enter winner name"}', 0.00, TRUE),
(7, 'text', 'Event Details', '{"maxLength": 60, "placeholder": "Enter event details"}', 0.00, TRUE),
(8, 'text', 'Engraved Text', '{"maxLength": 20, "placeholder": "Enter text"}', 0.00, TRUE),
(9, 'text', 'Custom Text', '{"maxLength": 30, "placeholder": "Enter text"}', 0.00, TRUE),
(9, 'image', 'Upload Logo', '{"maxSize": "5MB", "formats": ["jpg", "png"]}', 99.00, FALSE),
(10, 'text', 'Engraved Message', '{"maxLength": 40, "placeholder": "Enter message"}', 0.00, TRUE),
(11, 'text', 'Company Name', '{"maxLength": 40, "placeholder": "Enter company name"}', 0.00, TRUE),
(11, 'image', 'Upload Logo', '{"maxSize": "5MB", "formats": ["jpg", "png"]}', 199.00, FALSE),
(12, 'text', 'Logo Text', '{"maxLength": 30, "placeholder": "Enter text for 3D engraving"}', 0.00, TRUE),
(13, 'text', 'Engraved Message', '{"maxLength": 50, "placeholder": "Enter message"}', 0.00, TRUE),
(14, 'text', 'Name/Logo', '{"maxLength": 30, "placeholder": "Enter name or company"}', 0.00, TRUE),
(15, 'text', 'Name to Engrave', '{"maxLength": 40, "placeholder": "Enter name"}', 0.00, TRUE),
(15, 'image', 'Company Logo', '{"maxSize": "5MB", "formats": ["jpg", "png"]}', 199.00, FALSE);

COMMIT;