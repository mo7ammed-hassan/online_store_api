const express = require('express');
const router = express.Router();
const variantTypeController = require('../controllers/variantType');

router.route('/')
  .get(variantTypeController.getAllVariantType)
  .post(variantTypeController.addVariantType)

router.route('/:id')
  .get(variantTypeController.getVariantTypeById)
  .put(variantTypeController.updateVariantType)
  .delete(variantTypeController.deleteVariantType)


module.exports = router;

