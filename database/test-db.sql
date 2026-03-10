const db = require('../config/database');

const testDatabase = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test products table
    const [products] = await db.query('SELECT COUNT(*) as count FROM products');
    console.log(`✅ Products table: ${products[0].count} products`);
    
    // Show categories
    const [categories] = await db.query('SELECT DISTINCT category FROM products');
    console.log('✅ Categories found:');
    categories.forEach(c => console.log(`   - ${c.category}`));
    
    // Test users table
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users table: ${users[0].count} users`);
    
    // Test testimonials table
    const [testimonials] = await db.query('SELECT COUNT(*) as count FROM testimonials');
    console.log(`✅ Testimonials table: ${testimonials[0].count} testimonials`);
    
    console.log('\n✅ Database test complete!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    process.exit(0);
  }
};

testDatabase();