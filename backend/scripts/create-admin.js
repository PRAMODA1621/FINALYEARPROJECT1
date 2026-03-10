const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const createAdminUser = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'venus_db'
  });

  try {
    console.log('Creating admin user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    console.log('Admin password hash:', hashedPassword);

    // Check if admin exists
    const [existing] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@venusenterprises.com']
    );

    if (existing.length > 0) {
      // Update existing admin
      await connection.execute(
        'UPDATE users SET password = ?, role = ?, is_active = ? WHERE email = ?',
        [hashedPassword, 'admin', 1, 'admin@venusenterprises.com']
      );
      console.log('Admin user updated');
    } else {
      // Create new admin
      await connection.execute(
        'INSERT INTO users (email, password, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin@venusenterprises.com', hashedPassword, 'Admin', 'User', 'admin', 1]
      );
      console.log('Admin user created');
    }

    // Create regular user if not exists
    const [userExists] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['user@venus.com']
    );

    if (userExists.length === 0) {
      const userHash = await bcrypt.hash('User@123', salt);
      await connection.execute(
        'INSERT INTO users (email, password, first_name, last_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['user@venus.com', userHash, 'John', 'Doe', '9876543210', 'user', 1]
      );
      console.log('Regular user created');
    }

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

createAdminUser();