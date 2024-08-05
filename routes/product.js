const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

router.route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct)

router.route('/:id')
  .get(productController.getProductById)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct)


module.exports = router;

