const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

// Sync database (for development)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synced successfully');
    return true;
  } catch (error) {
    console.error('Error syncing database:', error);
    return false;
  }
};

// Run raw query with parameters
const runRawQuery = async (query, replacements = {}) => {
  try {
    const [results, metadata] = await sequelize.query(query, {
      replacements,
      type: Sequelize.QueryTypes.SELECT
    });
    return results;
  } catch (error) {
    console.error('Error running raw query:', error);
    throw error;
  }
};

// Get pagination parameters
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

// Get paginated data
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    items,
    totalPages,
    currentPage
  };
};

module.exports = {
  testConnection,
  syncDatabase,
  runRawQuery,
  getPagination,
  getPagingData
};