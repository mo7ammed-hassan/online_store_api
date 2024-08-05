const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');

router.route('/')
  .get(categoryController.getCategories)
  .post(categoryController.addCategory);

router.route('/:id')
  .get(categoryController.getCategoryById)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;