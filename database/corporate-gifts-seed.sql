-- Venus Enterprises - Corporate Gifts Only Database
USE venus_db;

-- Clear existing products (remove all irrelevant items)
DELETE FROM product_features;
DELETE FROM product_images;
DELETE FROM customization_options;
DELETE FROM products;

-- Reset auto increment
ALTER TABLE products AUTO_INCREMENT = 1;

-- Insert ONLY corporate gift products (NO shirts, phones, laptops, etc.)
INSERT INTO products (name, description, category, price, stock, image_url, is_featured) VALUES
-- Wooden Corporate Gifts
('Engraved Wooden Name Plate', 'Premium teak wood name plate with laser engraving. Perfect for office desks and executive cabins. Features durable finish and elegant design. Customize with name, designation, and company logo.', 'Wooden', 1299.00, 85, '/src/assets/images/wooden/wooden-nameplate.jpg', TRUE),
('Wooden Photo Frame Plaque', 'Handcrafted wooden photo frame with engraved message. Perfect for farewell gifts, retirement parties, and employee recognition. Available in multiple wood finishes.', 'Wooden', 1499.00, 60, '/src/assets/images/wooden/photo-frame.jpg', FALSE),
('Wooden Business Card Holder', 'Handcrafted wooden business card holder with engraved company logo. Holds approximately 20-25 cards. Perfect for executive desks and reception areas.', 'Wooden', 899.00, 75, '/src/assets/images/wooden/card-holder.jpg', FALSE),
('Wooden Pen Stand', 'Elegant wooden pen stand with laser engraved base. Perfect for office desks and corporate gifting. Holds multiple pens and accessories.', 'Wooden', 699.00, 100, '/src/assets/images/wooden/pen-stand.jpg', FALSE),
('Wooden Award Plaque', 'Premium wooden award plaque with metal inscription plate. Ideal for employee of the month, service awards, and recognition ceremonies.', 'Wooden', 1999.00, 40, '/src/assets/images/wooden/award-plaque.jpg', TRUE),

-- Acrylic Corporate Gifts
('Acrylic LED Name Plate', 'Modern acrylic name plate with energy-efficient LED backlighting. Creates stunning visual impact in any corporate setting. Touch-sensitive on/off switch. Available in multiple colors.', 'Acrylic', 1899.00, 45, '/src/assets/images/acrylic/led-nameplate.jpg', TRUE),
('Acrylic Trophy Award', 'Modern acrylic trophy for corporate competitions and recognition events. Clear acrylic with colored base. Custom engraving available for winner names and event details.', 'Acrylic', 1799.00, 50, '/src/assets/images/acrylic/trophy.jpg', TRUE),
('Acrylic Paper Weight', 'Clear acrylic paper weight with 3D laser engraved logo inside. Modern and elegant design for office desks. Makes a great corporate gift.', 'Acrylic', 599.00, 100, '/src/assets/images/acrylic/paper-weight.jpg', FALSE),
('Acrylic Plaque', 'Crystal clear acrylic plaque with engraved text. Perfect for service awards, recognition, and achievement celebrations.', 'Acrylic', 1299.00, 65, '/src/assets/images/acrylic/plaque.jpg', FALSE),
('Acrylic Desk Sign', 'Elegant acrylic desk sign with custom engraved text. Ideal for reception areas, executive offices, and conference rooms.', 'Acrylic', 999.00, 80, '/src/assets/images/acrylic/desk-sign.jpg', FALSE),

-- Metal Corporate Gifts
('Metal Engraved Pen', 'Stainless steel executive pen with precision laser engraving. Smooth ink flow and premium metal finish. Comes in gift box with engraving service.', 'Metal', 799.00, 120, '/src/assets/images/metal/engraved-pen.jpg', TRUE),
('Metal Keychain', 'Stainless steel keychain with laser engraving. Perfect for corporate giveaways and promotional events. Rust resistant and lightweight design.', 'Metal', 399.00, 200, '/src/assets/images/metal/keychain.jpg', FALSE),
('Corporate Desk Clock', 'Elegant desk clock with brushed metal frame and silent quartz movement. Features engraving plate for personalized messages. Perfect for executive gifts.', 'Metal', 1899.00, 45, '/src/assets/images/metal/desk-clock.jpg', TRUE),
('Metal Business Card Case', 'Premium stainless steel business card case with laser engraved logo. Slim profile fits in pocket. Holds 10-15 cards securely.', 'Metal', 699.00, 85, '/src/assets/images/metal/card-case.jpg', FALSE),
('Metal Letter Opener', 'Stainless steel letter opener with engraved handle. Classic corporate gift for executives and clients. Sharp blade with safety tip.', 'Metal', 499.00, 150, '/src/assets/images/metal/letter-opener.jpg', FALSE),
('Metal Money Clip', 'Slim stainless steel money clip with laser engraving. Perfect practical gift for corporate clients. Holds bills and cards securely.', 'Metal', 449.00, 175, '/src/assets/images/metal/money-clip.jpg', FALSE),
('Metal Bookmark', 'Elegant stainless steel bookmark with engraved message. Great corporate gift for literary events and client appreciation.', 'Metal', 299.00, 250, '/src/assets/images/metal/bookmark.jpg', FALSE),

-- Crystal Corporate Gifts
('Crystal Corporate Award', 'Premium crystal award trophy for recognition ceremonies. Optical crystal with laser engraved text. Includes elegant wooden base and premium gift box.', 'Crystal', 2499.00, 35, '/src/assets/images/crystal/crystal-award.jpg', TRUE),
('Crystal Paper Weight', 'Optical crystal paper weight with laser engraved message. Classic design perfect for executive gifts and retirement presents.', 'Crystal', 1299.00, 55, '/src/assets/images/crystal/paper-weight.jpg', TRUE),
('Crystal Star Award', 'Stunning crystal star award for excellence recognition. Laser engraved text on optical crystal. Includes display stand.', 'Crystal', 2199.00, 30, '/src/assets/images/crystal/star-award.jpg', TRUE),
('Crystal Globe Award', 'Elegant crystal globe award for international business achievements. Premium crystal with engraved base. Symbolizes global reach.', 'Crystal', 3299.00, 20, '/src/assets/images/crystal/globe-award.jpg', TRUE),
('Crystal Pyramid Award', 'Modern crystal pyramid award with engraved text. Perfect for innovation and achievement awards. Geometric design.', 'Crystal', 1899.00, 40, '/src/assets/images/crystal/pyramid-award.jpg', FALSE),

-- Corporate Gift Combos
('Corporate Gift Combo', 'Complete corporate gifting solution including engraved metal pen, premium leather diary, and custom metal keychain. Packaged in elegant branded box.', 'Corporate Gifts', 2999.00, 40, '/src/assets/images/corporate/gift-combo.jpg', TRUE),
('Customized Coffee Mug', 'Premium ceramic coffee mug with full-color logo printing. Dishwasher safe and microwave safe. Ideal for promotional events and employee gifts.', 'Corporate Gifts', 349.00, 150, '/src/assets/images/corporate/coffee-mug.jpg', FALSE),
('Corporate Leather Folder', 'Premium leather folder with engraved metal name plate. Includes padfolio and business card holder. Perfect for client meetings.', 'Corporate Gifts', 2199.00, 35, '/src/assets/images/corporate/leather-folder.jpg', TRUE),
('Executive Gift Set', 'Luxury gift set including metal pen, leather card holder, and engraved keychain. Premium packaging with custom message.', 'Corporate Gifts', 3599.00, 25, '/src/assets/images/corporate/executive-set.jpg', TRUE),
('Leather Mouse Pad', 'Premium leather mouse pad with stitched edges and engraved logo. Perfect executive desk accessory. Non-slip backing.', 'Corporate Gifts', 799.00, 80, '/src/assets/images/corporate/mouse-pad.jpg', FALSE),
('Corporate Diary', 'Premium leather-bound diary with engraved metal corner. Includes ribbon bookmark, pen loop, and quality paper.', 'Corporate Gifts', 1299.00, 60, '/src/assets/images/corporate/diary.jpg', FALSE),
('Leather Luggage Tag', 'Genuine leather luggage tag with engraved metal plate. Perfect corporate travel gift. Includes secure strap.', 'Corporate Gifts', 449.00, 120, '/src/assets/images/corporate/luggage-tag.jpg', FALSE);

-- Insert product features
INSERT INTO product_features (product_id, feature, display_order) VALUES
-- Wooden products (1-5)
(1, 'Premium teak wood construction', 1),
(1, 'Laser engraving technology', 2),
(1, 'Durable protective finish', 3),
(1, 'Multiple font styles available', 4),
(1, 'Custom logo engraving option', 5),
(2, 'Handcrafted wood frame', 1),
(2, 'Custom engraved message', 2),
(2, 'Multiple wood finishes', 3),
(2, 'Standard photo size 6x4', 4),
(3, 'Solid wood construction', 1),
(3, 'Custom logo engraving', 2),
(3, 'Holds 20-25 cards', 3),
(4, 'Elegant wooden design', 1),
(4, 'Laser engraved base', 2),
(4, 'Holds multiple pens', 3),
(5, 'Premium wood finish', 1),
(5, 'Metal inscription plate', 2),
(5, 'Wall mountable', 3),

-- Acrylic products (6-10)
(6, 'Energy-efficient LED backlighting', 1),
(6, 'Touch-sensitive on/off switch', 2),
(6, 'High-quality acrylic material', 3),
(6, 'Available in 5 LED colors', 4),
(6, 'Custom text engraving', 5),
(7, 'Clear acrylic construction', 1),
(7, 'Colored acrylic base', 2),
(7, 'Custom winner engraving', 3),
(7, 'Lightweight design', 4),
(8, 'Clear acrylic material', 1),
(8, '3D laser engraved logo', 2),
(9, 'Crystal clear acrylic', 1),
(9, 'Laser engraved text', 2),
(10, 'Elegant desk accessory', 1),
(10, 'Custom text engraving', 2),

-- Metal products (11-17)
(11, 'Stainless steel construction', 1),
(11, 'Precision laser engraving', 2),
(11, 'Smooth ink flow system', 3),
(11, 'Refillable ink cartridge', 4),
(11, 'Gift box packaging', 5),
(12, 'Stainless steel material', 1),
(12, 'Laser engraving compatible', 2),
(12, 'Rust-resistant finish', 3),
(13, 'Brushed metal frame', 1),
(13, 'Silent quartz movement', 2),
(13, 'Engraving plate included', 3),
(14, 'Premium stainless steel', 1),
(14, 'Laser engraved logo', 2),
(14, 'Slim pocket design', 3),
(15, 'Stainless steel blade', 1),
(15, 'Engraved handle', 2),
(16, 'Slim stainless steel', 1),
(16, 'Secure money clip', 2),
(16, 'Laser engraving', 3),
(17, 'Elegant stainless steel', 1),
(17, 'Engraved message', 2),

-- Crystal products (18-22)
(18, 'Optical crystal construction', 1),
(18, 'Laser engraved nameplate', 2),
(18, 'Elegant wooden base', 3),
(18, 'Premium gift box included', 4),
(19, 'Optical crystal', 1),
(19, 'Laser engraved message', 2),
(20, 'Stunning crystal star', 1),
(20, 'Laser engraved text', 2),
(21, 'Elegant crystal globe', 1),
(21, 'Engraved base', 2),
(22, 'Modern crystal pyramid', 1),
(22, 'Laser engraved text', 2),

-- Corporate Gifts (23-29)
(23, 'Premium leather diary', 1),
(23, 'Engraved metal pen', 2),
(23, 'Custom metal keychain', 3),
(23, 'Branded gift box', 4),
(24, 'Premium ceramic material', 1),
(24, 'Full-color logo printing', 2),
(24, 'Dishwasher safe', 3),
(24, 'Microwave safe', 4),
(25, 'Premium leather', 1),
(25, 'Engraved name plate', 2),
(25, 'Includes padfolio', 3),
(26, 'Luxury gift set', 1),
(26, 'Premium packaging', 2),
(27, 'Premium leather', 1),
(27, 'Stitched edges', 2),
(27, 'Engraved logo', 3),
(28, 'Leather-bound', 1),
(28, 'Engraved metal corner', 2),
(28, 'Ribbon bookmark', 3),
(29, 'Genuine leather', 1),
(29, 'Engraved metal plate', 2);

-- Insert customization options
INSERT INTO customization_options (product_id, option_type, option_name, option_values, additional_price, is_required) VALUES
(1, 'text', 'Name to Engrave', '{"maxLength": 40, "placeholder": "Enter name and title"}', 0.00, TRUE),
(1, 'text', 'Designation', '{"maxLength": 50, "placeholder": "Enter designation"}', 0.00, FALSE),
(1, 'font', 'Font Style', '["Classic", "Modern", "Elegant", "Bold"]', 0.00, FALSE),
(1, 'color', 'Wood Finish', '["Natural", "Dark Walnut", "Mahogany", "Oak"]', 0.00, TRUE),
(6, 'text', 'Name to Display', '{"maxLength": 30, "placeholder": "Enter name"}', 0.00, TRUE),
(6, 'color', 'LED Color', '["White", "Blue", "Red", "Green", "RGB"]', 199.00, FALSE),
(11, 'text', 'Engraved Text', '{"maxLength": 30, "placeholder": "Enter text"}', 0.00, TRUE),
(11, 'color', 'Pen Color', '["Silver", "Gold", "Black", "Rose Gold"]', 0.00, TRUE),
(18, 'text', 'Award Text', '{"maxLength": 60, "placeholder": "Enter award message"}', 0.00, TRUE),
(18, 'text', 'Recipient Name', '{"maxLength": 40, "placeholder": "Enter recipient name"}', 0.00, TRUE),
(23, 'text', 'Company Name', '{"maxLength": 50, "placeholder": "Enter company name"}', 0.00, TRUE),
(23, 'text', 'Recipient Name', '{"maxLength": 40, "placeholder": "Enter recipient name"}', 0.00, TRUE),
(23, 'image', 'Upload Logo', '{"maxSize": "5MB", "formats": ["jpg", "png", "svg"]}', 299.00, FALSE);

-- Insert corporate testimonials
INSERT INTO testimonials (customer_name, customer_location, content, rating) VALUES
('Rajesh Kumar', 'Mumbai', 'The crystal awards we ordered for our annual conference were absolutely stunning. The engraving quality is exceptional and our employees loved them.', 5),
('Priya Sharma', 'Delhi', 'Venus Enterprises provided excellent corporate gifts for our client appreciation event. The engraved pens were a huge hit!', 5),
('Amit Patel', 'Bangalore', 'The custom engraved wooden name plates look fantastic in our new office. Professional quality and timely delivery.', 5),
('Neha Gupta', 'Pune', 'Ordered 50 gift combos for employee appreciation. Everyone loved the packaging and customization options.', 5),
('Vikram Singh', 'Chennai', 'The acrylic LED name plates are stunning! Modern look and excellent build quality. Our executives love them.', 5),
('Ananya Desai', 'Hyderabad', 'Our clients were impressed with the crystal awards. The presentation and quality exceeded expectations.', 5);

COMMIT;