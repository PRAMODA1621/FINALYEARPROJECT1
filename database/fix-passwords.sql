const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixPasswords = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'venus_db'
  });

  try {
    console.log('🔧 Fixing user passwords...\n');

    // Check current users
    const [users] = await connection.execute('SELECT id, email, password FROM users');
    console.log('Current users:');
    users.forEach(u => {
      console.log(`- ${u.email}: ${u.password ? 'has password' : 'NO PASSWORD'}`);
    });

    // Generate new hashes
    const adminPassword = 'Admin@123';
    const userPassword = 'User@123';
    
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash(adminPassword, salt);
    const userHash = await bcrypt.hash(userPassword, salt);
    
    console.log('\n📝 New password hashes:');
    console.log(`Admin hash: ${adminHash}`);
    console.log(`User hash: ${userHash}`);

    // Update or create admin user
    await connection.execute(`
      INSERT INTO users (email, password, first_name, last_name, role, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      password = VALUES(password),
      first_name = VALUES(first_name),
      last_name = VALUES(last_name),
      role = VALUES(role),
      is_active = VALUES(is_active)
    `, ['admin@venusenterprises.com', adminHash, 'Admin', 'User', 'admin', 1]);

    console.log('✅ Admin user updated/created');

    // Update or create regular user
    await connection.execute(`
      INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      password = VALUES(password),
      first_name = VALUES(first_name),
      last_name = VALUES(last_name),
      phone = VALUES(phone),
      role = VALUES(role),
      is_active = VALUES(is_active)
    `, ['user@venus.com', userHash, 'John', 'Doe', '9876543210', 'user', 1]);

    console.log('✅ Regular user updated/created');

    // Verify the passwords work
    console.log('\n🔐 Testing passwords:');
    
    const [updatedAdmin] = await connection.execute(
      'SELECT password FROM users WHERE email = ?', 
      ['admin@venusenterprises.com']
    );
    
    const adminMatch = await bcrypt.compare('Admin@123', updatedAdmin[0].password);
    console.log(`Admin password test: ${adminMatch ? '✅ WORKS' : '❌ FAILS'}`);

    const [updatedUser] = await connection.execute(
      'SELECT password FROM users WHERE email = ?', 
      ['user@venus.com']
    );
    
    const userMatch = await bcrypt.compare('User@123', updatedUser[0].password);
    console.log(`User password test: ${userMatch ? '✅ WORKS' : '❌ FAILS'}`);

    // Show final users
    const [finalUsers] = await connection.execute('SELECT id, email, role FROM users');
    console.log('\n📋 Final users in database:');
    finalUsers.forEach(u => {
      console.log(`- ${u.email} (${u.role})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
};

fixPasswords();