const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variant');

router.route('/')
  .get(variantController.getAllVariant)
  .post(variantController.addVariant)

router.route('/:id')
  .get(variantController.getVariantById)
  .put(variantController.updateVariant)
  .delete(variantController.deleteVariant)


module.exports = router;

