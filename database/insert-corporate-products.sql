-- Venus Enterprises - Insert Corporate Products Only
USE venus_db;

-- First, delete ALL existing products
DELETE FROM product_features;
DELETE FROM customization_options;
DELETE FROM products;

-- Reset auto increment
ALTER TABLE products AUTO_INCREMENT = 1;

-- Insert ONLY corporate gift products (NO electronics, clothing, sports)
INSERT INTO products (name, description, category, price, stock, image_url, is_featured) VALUES
-- Wooden Products
('Engraved Wooden Name Plate', 'Premium teak wood name plate with laser engraving. Perfect for office desks and executive cabins. Customize with name, designation, and company logo.', 'Wooden', 1299.00, 85, '/images/wooden/wooden-name-plate.jpg', 1),
('Wooden Photo Frame Plaque', 'Handcrafted wooden photo frame with engraved message. Perfect for farewell gifts and employee recognition.', 'Wooden', 1499.00, 60, '/images/wooden/photo-frame.jpg', 0),
('Wooden Business Card Holder', 'Handcrafted wooden business card holder with engraved company logo. Holds 20-25 cards.', 'Wooden', 899.00, 75, '/images/wooden/card-holder.jpg', 0),
('Wooden Pen Stand', 'Elegant wooden pen stand with laser engraved base. Perfect for office desks.', 'Wooden', 699.00, 100, '/images/wooden/pen-stand.jpg', 0),
('Wooden Award Plaque', 'Premium wooden award plaque with metal inscription plate. Ideal for employee recognition.', 'Wooden', 1999.00, 40, '/images/wooden/award-plaque.jpg', 1),

-- Acrylic Products
('Acrylic LED Name Plate', 'Modern acrylic name plate with energy-efficient LED backlighting. Touch-sensitive on/off switch.', 'Acrylic', 1899.00, 45, '/images/acrylic/led-nameplate.jpg', 1),
('Acrylic Trophy Award', 'Modern acrylic trophy for corporate competitions. Clear acrylic with colored base.', 'Acrylic', 1799.00, 50, '/images/acrylic/trophy.jpg', 1),
('Acrylic Paper Weight', 'Clear acrylic paper weight with 3D laser engraved logo inside.', 'Acrylic', 599.00, 100, '/images/acrylic/paper-weight.jpg', 0),
('Acrylic Plaque', 'Crystal clear acrylic plaque with engraved text. Perfect for service awards.', 'Acrylic', 1299.00, 65, '/images/acrylic/plaque.jpg', 0),
('Acrylic Desk Sign', 'Elegant acrylic desk sign with custom engraved text. Ideal for reception areas.', 'Acrylic', 999.00, 80, '/images/acrylic/desk-sign.jpg', 0),

-- Metal Products
('Metal Engraved Pen', 'Stainless steel executive pen with precision laser engraving. Smooth ink flow. Gift box included.', 'Metal', 799.00, 120, '/images/metal/engraved-pen.jpg', 1),
('Metal Keychain', 'Stainless steel keychain with laser engraving. Perfect for corporate giveaways.', 'Metal', 399.00, 200, '/images/metal/keychain.jpg', 0),
('Corporate Desk Clock', 'Elegant desk clock with brushed metal frame and silent quartz movement. Engraving plate included.', 'Metal', 1899.00, 45, '/images/metal/desk-clock.jpg', 1),
('Metal Business Card Case', 'Premium stainless steel business card case with laser engraved logo. Slim pocket design.', 'Metal', 699.00, 85, '/images/metal/card-case.jpg', 0),
('Metal Letter Opener', 'Stainless steel letter opener with engraved handle. Classic corporate gift.', 'Metal', 499.00, 150, '/images/metal/letter-opener.jpg', 0),
('Metal Money Clip', 'Slim stainless steel money clip with laser engraving. Holds bills and cards securely.', 'Metal', 449.00, 175, '/images/metal/money-clip.jpg', 0),
('Metal Bookmark', 'Elegant stainless steel bookmark with engraved message. Great corporate gift.', 'Metal', 299.00, 250, '/images/metal/bookmark.jpg', 0),

-- Crystal Products
('Crystal Corporate Award', 'Premium crystal award trophy for recognition ceremonies. Optical crystal with laser engraved text. Wooden base included.', 'Crystal', 2499.00, 35, '/images/crystal/crystal-award.jpg', 1),
('Crystal Paper Weight', 'Optical crystal paper weight with laser engraved message. Classic executive gift.', 'Crystal', 1299.00, 55, '/images/crystal/paper-weight.jpg', 1),
('Crystal Star Award', 'Stunning crystal star award for excellence recognition. Laser engraved text.', 'Crystal', 2199.00, 30, '/images/crystal/star-award.jpg', 1),
('Crystal Globe Award', 'Elegant crystal globe award for international business achievements. Engraved base.', 'Crystal', 3299.00, 20, '/images/crystal/globe-award.jpg', 1),
('Crystal Pyramid Award', 'Modern crystal pyramid award with engraved text. Perfect for innovation awards.', 'Crystal', 1899.00, 40, '/images/crystal/pyramid-award.jpg', 0),

-- Corporate Gift Combos
('Corporate Gift Combo', 'Complete corporate gifting solution including engraved metal pen, premium leather diary, and custom metal keychain. Branded gift box.', 'Corporate Gifts', 2999.00, 40, '/images/corporate/gift-combo.jpg', 1),
('Customized Coffee Mug', 'Premium ceramic coffee mug with full-color logo printing. Dishwasher safe.', 'Corporate Gifts', 349.00, 150, '/images/corporate/coffee-mug.jpg', 0),
('Corporate Leather Folder', 'Premium leather folder with engraved metal name plate. Includes padfolio and business card holder.', 'Corporate Gifts', 2199.00, 35, '/images/corporate/leather-folder.jpg', 1),
('Executive Gift Set', 'Luxury gift set including metal pen, leather card holder, and engraved keychain. Premium packaging.', 'Corporate Gifts', 3599.00, 25, '/images/corporate/executive-set.jpg', 1),
('Leather Mouse Pad', 'Premium leather mouse pad with stitched edges and engraved logo. Non-slip backing.', 'Corporate Gifts', 799.00, 80, '/images/corporate/mouse-pad.jpg', 0),
('Corporate Diary', 'Premium leather-bound diary with engraved metal corner. Ribbon bookmark and pen loop.', 'Corporate Gifts', 1299.00, 60, '/images/corporate/diary.jpg', 0),
('Leather Luggage Tag', 'Genuine leather luggage tag with engraved metal plate. Includes secure strap.', 'Corporate Gifts', 449.00, 120, '/images/corporate/luggage-tag.jpg', 0),

-- Mementos
('Memento of Gratitude', 'Beautiful memento to express gratitude and appreciation. Custom engraved message.', 'Mementos', 1499.00, 65, '/images/mementos/gratitude.jpg', 0),
('Memento of Service', 'Elegant memento for years of service recognition. Laser engraved.', 'Mementos', 1899.00, 40, '/images/mementos/service.jpg', 1),

-- Marble Products
('Marble Base Award', 'Elegant marble base award with metal plate. Perfect for lifetime achievement.', 'Marble', 3999.00, 20, '/images/marble/marble-award.jpg', 1),
('Marble Paperweight', 'Elegant marble paperweight with engraved metal plate. Classic desk accessory.', 'Marble', 1299.00, 40, '/images/marble/paperweight.jpg', 0),
('Marble Plaque', 'Premium marble plaque with metal inscription. Perfect for corporate awards.', 'Marble', 3299.00, 25, '/images/marble/plaque.jpg', 1);

-- Show the inserted products
SELECT 'Products inserted successfully:' as '';
SELECT id, name, category, price FROM products ORDER BY category, name;

-- Count products by category
SELECT 'Product count by category:' as '';
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category;