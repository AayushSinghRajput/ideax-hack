const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getAllProducts,
  getAllProductsName,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} = require('../controllers/productController');

const {upload}  = require('../config/cloudinary');

const router = express.Router();



// Routes
router.get('/', getAllProducts);
router.get("/product-name",getAllProductsName);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

//Upload single image named 'productImage'
router.post('/', upload.single('productImage'), createProduct);
router.put('/:id', upload.single('productImage'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
