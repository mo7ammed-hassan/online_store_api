const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brands');

router.route('/')
  .get(brandController.getAllBrands)
  .post(brandController.createBrand)

router.route('/:id')
  .get(brandController.getBrandById)
  .put(brandController.updateBrand)
  .delete(brandController.deleteBrand)


module.exports = router;

