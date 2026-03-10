-- VENUS ENTERPRISES - Corporate Gifts Catalog Seed Data
USE venus_db;

-- Clear existing products (optional - comment out if you want to keep existing data)
-- DELETE FROM products;
-- ALTER TABLE products AUTO_INCREMENT = 1;

-- Insert predefined corporate gift products
INSERT INTO products (name, description, category, price, stock, image_url, is_featured, is_active) VALUES
('Premium Engraved Metal Pen', 'Elegant stainless steel engraved pen designed for corporate gifting and executive use.', 'Corporate Gifts', 799.00, 120, '/images/products/premium-metal-pen.jpg', TRUE, TRUE),
('Crystal Corporate Award Trophy', 'Premium crystal award trophy perfect for corporate recognition ceremonies.', 'Awards', 2499.00, 60, '/images/products/crystal-award.jpg', TRUE, TRUE),
('Engraved Wooden Name Plate', 'Custom engraved wooden name plate suitable for office desks and doors.', 'Office Decor', 1299.00, 90, '/images/products/wooden-nameplate.jpg', TRUE, TRUE),
('Custom Photo Frame Plaque', 'Personalized photo frame plaque ideal for corporate gifting and memories.', 'Personalized Gifts', 1499.00, 75, '/images/products/photo-frame.jpg', FALSE, TRUE),
('Corporate Gift Combo Kit', 'Professional corporate gift combo including pen, diary, and keychain.', 'Corporate Gifts', 2999.00, 40, '/images/products/gift-combo.jpg', TRUE, TRUE),
('Leather Executive Diary', 'Premium leather diary for professionals and executives.', 'Office Essentials', 999.00, 110, '/images/products/leather-diary.jpg', FALSE, TRUE),
('Stainless Steel Keychain', 'Minimal stainless steel keychain perfect for engraving names.', 'Accessories', 399.00, 200, '/images/products/keychain.jpg', FALSE, TRUE),
('Engraved Corporate Desk Clock', 'Elegant desk clock suitable for corporate gifting.', 'Office Decor', 1899.00, 55, '/images/products/desk-clock.jpg', TRUE, TRUE),
('Promotional Coffee Mug', 'Ceramic promotional mug ideal for branding and giveaways.', 'Promotional Products', 349.00, 250, '/images/products/coffee-mug.jpg', FALSE, TRUE),
('Custom Engraved Glass Plaque', 'Professional glass plaque for awards and recognition events.', 'Awards', 1799.00, 70, '/images/products/glass-plaque.jpg', TRUE, TRUE);

-- Insert product features (new table for features)
CREATE TABLE IF NOT EXISTS product_features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    feature TEXT NOT NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert features for each product
-- Product 1: Premium Engraved Metal Pen
INSERT INTO product_features (product_id, feature, display_order) VALUES
(1, 'Laser engraving support', 1),
(1, 'Premium metal finish', 2),
(1, 'Smooth ink flow', 3),
(1, 'Gift box packaging', 4);

-- Product 2: Crystal Corporate Award Trophy
INSERT INTO product_features (product_id, feature, display_order) VALUES
(2, 'Optical crystal', 1),
(2, 'Laser engraved nameplate', 2),
(2, 'Elegant base stand', 3);

-- Product 3: Engraved Wooden Name Plate
INSERT INTO product_features (product_id, feature, display_order) VALUES
(3, 'Premium teak wood', 1),
(3, 'Laser engraving', 2),
(3, 'Durable finish', 3);

-- Product 4: Custom Photo Frame Plaque
INSERT INTO product_features (product_id, feature, display_order) VALUES
(4, 'High resolution print', 1),
(4, 'Wooden backing', 2),
(4, 'Wall mount support', 3);

-- Product 5: Corporate Gift Combo Kit
INSERT INTO product_features (product_id, feature, display_order) VALUES
(5, 'Premium packaging', 1),
(5, 'Custom branding available', 2),
(5, 'Perfect for employee welcome kits', 3);

-- Product 6: Leather Executive Diary
INSERT INTO product_features (product_id, feature, display_order) VALUES
(6, 'Leather cover', 1),
(6, 'Bookmark ribbon', 2),
(6, 'Smooth paper', 3);

-- Product 7: Stainless Steel Keychain
INSERT INTO product_features (product_id, feature, display_order) VALUES
(7, 'Rust resistant', 1),
(7, 'Lightweight design', 2),
(7, 'Laser engraving compatible', 3);

-- Product 8: Engraved Corporate Desk Clock
INSERT INTO product_features (product_id, feature, display_order) VALUES
(8, 'Metal frame', 1),
(8, 'Silent clock movement', 2),
(8, 'Engraving plate', 3);

-- Product 9: Promotional Coffee Mug
INSERT INTO product_features (product_id, feature, display_order) VALUES
(9, 'High quality ceramic', 1),
(9, 'Dishwasher safe', 2),
(9, 'Logo printing support', 3);

-- Product 10: Custom Engraved Glass Plaque
INSERT INTO product_features (product_id, feature, display_order) VALUES
(10, 'Tempered glass', 1),
(10, 'Laser engraving', 2),
(10, 'Elegant stand', 3);

-- Insert product images
CREATE TABLE IF NOT EXISTS product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert multiple images for each product
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
(1, '/images/products/premium-metal-pen-1.jpg', TRUE, 1),
(1, '/images/products/premium-metal-pen-2.jpg', FALSE, 2),
(1, '/images/products/premium-metal-pen-3.jpg', FALSE, 3),
(2, '/images/products/crystal-award-1.jpg', TRUE, 1),
(2, '/images/products/crystal-award-2.jpg', FALSE, 2),
(3, '/images/products/wooden-nameplate-1.jpg', TRUE, 1),
(3, '/images/products/wooden-nameplate-2.jpg', FALSE, 2),
(4, '/images/products/photo-frame-1.jpg', TRUE, 1),
(4, '/images/products/photo-frame-2.jpg', FALSE, 2),
(5, '/images/products/gift-combo-1.jpg', TRUE, 1),
(5, '/images/products/gift-combo-2.jpg', FALSE, 2),
(5, '/images/products/gift-combo-3.jpg', FALSE, 3),
(6, '/images/products/leather-diary-1.jpg', TRUE, 1),
(6, '/images/products/leather-diary-2.jpg', FALSE, 2),
(7, '/images/products/keychain-1.jpg', TRUE, 1),
(7, '/images/products/keychain-2.jpg', FALSE, 2),
(8, '/images/products/desk-clock-1.jpg', TRUE, 1),
(8, '/images/products/desk-clock-2.jpg', FALSE, 2),
(9, '/images/products/coffee-mug-1.jpg', TRUE, 1),
(9, '/images/products/coffee-mug-2.jpg', FALSE, 2),
(9, '/images/products/coffee-mug-3.jpg', FALSE, 3),
(10, '/images/products/glass-plaque-1.jpg', TRUE, 1),
(10, '/images/products/glass-plaque-2.jpg', FALSE, 2);

-- Insert customization options for each customizable product
CREATE TABLE IF NOT EXISTS customization_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    option_type ENUM('text', 'font', 'color', 'image') NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    option_values JSON,
    additional_price DECIMAL(10, 2) DEFAULT 0.00,
    is_required BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- All products are customizable (id 1-10)
-- Product 1: Premium Engraved Metal Pen
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(1, 'text', 'Engraved Text', '{"maxLength": 30, "placeholder": "Enter text to engrave"}', 0.00, TRUE),
(1, 'font', 'Font Style', '["Classic", "Modern", "Script", "Bold"]', 0.00, FALSE),
(1, 'color', 'Pen Color', '["Silver", "Gold", "Black", "Rose Gold"]', 0.00, TRUE);

-- Product 2: Crystal Corporate Award Trophy
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(2, 'text', 'Engraved Text', '{"maxLength": 50, "placeholder": "Enter award text"}', 0.00, TRUE),
(2, 'font', 'Font Style', '["Classic", "Elegant", "Bold"]', 0.00, FALSE);

-- Product 3: Engraved Wooden Name Plate
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(3, 'text', 'Name Text', '{"maxLength": 40, "placeholder": "Enter name/title"}', 0.00, TRUE),
(3, 'font', 'Font Style', '["Classic", "Modern", "Script"]', 0.00, FALSE),
(3, 'color', 'Wood Finish', '["Natural", "Dark Walnut", "Mahogany", "Oak"]', 0.00, TRUE);

-- Product 4: Custom Photo Frame Plaque
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(4, 'text', 'Engraved Message', '{"maxLength": 100, "placeholder": "Enter message"}', 0.00, TRUE),
(4, 'image', 'Upload Photo', '{"maxSize": "5MB", "formats": ["jpg", "png"]}', 0.00, TRUE),
(4, 'color', 'Frame Color', '["Black", "Brown", "White", "Natural"]', 0.00, FALSE);

-- Product 5: Corporate Gift Combo Kit
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(5, 'text', 'Company Name', '{"maxLength": 50, "placeholder": "Enter company name"}', 0.00, TRUE),
(5, 'image', 'Upload Logo', '{"maxSize": "5MB", "formats": ["jpg", "png", "svg"]}', 199.00, FALSE),
(5, 'color', 'Combo Color', '["Black", "Blue", "Red", "Green"]', 0.00, FALSE);

-- Product 6: Leather Executive Diary
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(6, 'text', 'Name Embossing', '{"maxLength": 30, "placeholder": "Enter name"}', 99.00, FALSE),
(6, 'color', 'Leather Color', '["Brown", "Black", "Burgundy", "Navy"]', 0.00, TRUE);

-- Product 7: Stainless Steel Keychain
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(7, 'text', 'Engraved Text', '{"maxLength": 20, "placeholder": "Enter text"}', 0.00, TRUE),
(7, 'font', 'Font Style', '["Classic", "Modern", "Minimal"]', 0.00, FALSE);

-- Product 8: Engraved Corporate Desk Clock
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(8, 'text', 'Engraved Message', '{"maxLength": 40, "placeholder": "Enter message"}', 0.00, TRUE),
(8, 'color', 'Clock Color', '["Silver", "Gold", "Black", "Rose Gold"]', 0.00, TRUE);

-- Product 9: Promotional Coffee Mug
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(9, 'text', 'Custom Text', '{"maxLength": 30, "placeholder": "Enter text"}', 0.00, TRUE),
(9, 'image', 'Upload Logo', '{"maxSize": "5MB", "formats": ["jpg", "png"]}', 49.00, FALSE),
(9, 'color', 'Mug Color', '["White", "Black", "Navy", "Red"]', 0.00, TRUE);

-- Product 10: Custom Engraved Glass Plaque
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(10, 'text', 'Engraved Text', '{"maxLength": 60, "placeholder": "Enter award text"}', 0.00, TRUE),
(10, 'font', 'Font Style', '["Classic", "Elegant", "Modern"]', 0.00, FALSE);

-- Insert customer testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    customer_title VARCHAR(100),
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO testimonials (customer_name, customer_title, content, rating, image_url) VALUES
('Rajesh Kumar', 'CEO, TechSolutions Inc.', 'The crystal awards we ordered were absolutely stunning. The engraving quality is exceptional and our employees loved them.', 5, '/images/testimonials/rajesh.jpg'),
('Priya Sharma', 'HR Manager, Global Corp', 'Venus Enterprises provided excellent corporate gifts for our annual conference. The premium metal pens were a huge hit!', 5, '/images/testimonials/priya.jpg'),
('Amit Patel', 'Marketing Director', 'The custom engraved name plates look fantastic in our office. Professional quality and timely delivery.', 4, '/images/testimonials/amit.jpg'),
('Neha Gupta', 'Event Coordinator', 'Ordered 50 gift combos for employee appreciation. Everyone loved the packaging and customization options.', 5, '/images/testimonials/neha.jpg');

COMMIT;