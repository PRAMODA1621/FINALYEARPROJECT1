const express = require('express');
const router = express.Router();

const { 
  getProducts, 
  getProductById,
  getProductByName, 
  getFeaturedProducts, 
  getCategories 
} = require('../controllers/productController');


// Specific routes FIRST
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/name/:name', getProductByName);

// Get all products
router.get('/', getProducts);

// Dynamic route LAST
router.get('/:id', getProductById);

module.exports = router;