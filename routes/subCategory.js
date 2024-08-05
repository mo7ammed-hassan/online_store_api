const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategory');

router.route('/')
  .get(subCategoryController.getSubCategories)
  .post(subCategoryController.addSubCategory);

router.route('/:id')
  .get(subCategoryController.getSubCategoryById)
  .put(subCategoryController.addSubCategory)
  .delete(subCategoryController.deleteSubCategory);

module.exports = router;