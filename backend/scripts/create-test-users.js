const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const createUsers = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'venus_db'
  });

  try {
    console.log('Creating test users...');
    
    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const userHash = await bcrypt.hash('User@123', salt);
    
    console.log('Admin password hash:', adminHash);
    console.log('User password hash:', userHash);

    // Delete existing users (optional - comment out if you want to keep them)
    await connection.execute('DELETE FROM users WHERE email IN (?, ?)', 
      ['admin@venusenterprises.com', 'user@venus.com']);

    // Create admin user
    await connection.execute(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin@venusenterprises.com', adminHash, 'Admin', 'User', 'admin', 1]
    );
    console.log('Admin user created');

    // Create regular user
    await connection.execute(
      `INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['user@venus.com', userHash, 'John', 'Doe', '9876543210', 'user', 1]
    );
    console.log('Regular user created');

    // Verify users
    const [users] = await connection.execute(
      'SELECT id, email, role, is_active FROM users'
    );
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) [${user.is_active ? 'active' : 'inactive'}]`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
};

createUsers();