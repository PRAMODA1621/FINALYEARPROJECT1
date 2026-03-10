const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById,
  getProductByName, 
  getFeaturedProducts, 
  getCategories 
} = require('../controllers/productController');

// IMPORTANT: Order matters - specific routes before dynamic ones
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/name/:name', getProductByName);
router.get('/:id', getProductById);
router.get('/', getProducts);

module.exports = router;