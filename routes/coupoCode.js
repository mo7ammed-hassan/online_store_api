const express = require('express');
const router = express.Router();
const coupoCodeController = require('../controllers/coupoCode');

router.route('/')
  .get(coupoCodeController.getAllCouponCodes)
  .post(coupoCodeController.createCouponCode)
  .post(coupoCodeController.checkCouponCode);


router.route('/:id')
  .get(coupoCodeController.getCouponCodeById)
  .delete(coupoCodeController.deleteCouponCode)
  .put(coupoCodeController.updateCouponCode);


module.exports = router;




