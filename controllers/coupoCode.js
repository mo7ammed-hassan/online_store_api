const CouponCode = require('../models/couponCode');
const HttpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const asyncWrapper = require('../middleWare/asyncWrapper');

const getAllCouponCodes = asyncWrapper(
  async (req, res) => {
    const couponCodes = await CouponCode.find()
      .populate('applicableCategory', 'id name')
      .populate('applicableProduct', 'id name');;
    if (!couponCodes) {
      const error = AppError.create('No coupon codes found', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Coupon codes retrieved successfully.', data: couponCodes });
  }
);

const getCouponCodeById = asyncWrapper(
  async (req, res, next) => {
    const couponCode = await CouponCode.findById(req.params.id)
      .populate('applicableCategory', 'id name')
      .populate('applicableProduct', 'id name')
      .populate('applicableSubCategory', 'id name');
    if (!couponCode) {
      const error = AppError.create('No coupon code found', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Coupon code retrieved successfully.', data: couponCode });
  }
);


const createCouponCode = asyncWrapper(
  async (req, res, next) => {
    const { couponCode, discountType, discountAmount, minimumPurchaseAmount, endDate, status, applicableCategory, applicableSubCategory, applicableProduct } = req.body;

    if (!couponCode || !discountType || !discountAmount || !minimumPurchaseAmount || !endDate || !status || !applicableCategory || !applicableSubCategory || !applicableProduct) {
      const error = AppError.create("Code, discountType, discountAmount, endDate, and status are required.", 400, HttpStatusText.FAIL);
      return next(error);
    }

    const newCouponCode = new CouponCode({
      couponCode,
      discountType,
      discountAmount,
      minimumPurchaseAmount,
      endDate,
      status,
      applicableCategory,
      applicableSubCategory,
      applicableProduct
    });
    await newCouponCode.save();

    return res.status(201).json({ success: true, message: 'Coupon code created successfully.', data: newCouponCode });
  }
);

const updateCouponCode = asyncWrapper(
  async (req, res, next) => {
    const couponCodeID = req.params.id;
    const { couponCode, discountType, discountAmount, minimumPurchaseAmount, endDate, status, applicableCategory, applicableSubCategory, applicableProduct } = req.body;

    //required fields
    if (!couponCode || !discountType || !discountAmount || !endDate || !status) {
      return res.status(400).json({ success: false, message: "CouponCode, discountType, discountAmount, endDate, and status are required." });
    }

    const updatedCouponCode = await CouponCode.findByIdAndUpdate(couponCodeID,
      { couponCode, discountType, discountAmount, minimumPurchaseAmount, endDate, status, applicableCategory, applicableSubCategory, applicableProduct },
      { new: true });

    if (!updatedCouponCode) {
      const error = AppError.create("No coupon code found with that ID", 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: "Coupon code updated successfully.", data: updatedCouponCode });
  }
);

const deleteCouponCode = asyncWrapper(
  async (req, res, next) => {
    const couponCodeID = req.params.id;
    const deletedCouponCode = await CouponCode.findByIdAndDelete(couponCodeID);
    if (!deletedCouponCode) {
      const error = AppError.create("No coupon code found with that ID", 404, HttpStatusText.FAIL);
      return next(error);
    }

    return res.json({ success: true, message: "Coupon code deleted successfully." });
  }
);

const checkCouponCode = asyncWrapper(
  async (req, res, next) => {
    const { couponCode, productIds, purchaseAmount } = req.body;

    // Find the coupon with the provided coupon code
    const coupon = await Coupon.findOne({ couponCode });


    // If coupon is not found, return false
    if (!coupon) {
      return res.json({ success: false, message: "Coupon not found." });
    }

    // Check if the coupon is expired
    const currentDate = new Date();
    if (coupon.endDate < currentDate) {
      return res.json({ success: false, message: "Coupon is expired." });
    }

    // Check if the coupon is active
    if (coupon.status !== 'active') {
      return res.json({ success: false, message: "Coupon is inactive." });
    }

    // Check if the purchase amount is greater than the minimum purchase amount specified in the coupon
    if (coupon.minimumPurchaseAmount && purchaseAmount < coupon.minimumPurchaseAmount) {
      return res.json({ success: false, message: "Minimum purchase amount not met." });
    }

    // Check if the coupon is applicable for all orders
    if (!coupon.applicableCategory && !coupon.applicableSubCategory && !coupon.applicableProduct) {
      return res.json({ success: true, message: "Coupon is applicable for all orders.", data: coupon });
    }

    // Fetch the products from the database using the provided product IDs
    const products = await Product.find({ _id: { $in: productIds } });

    // Check if any product in the list is not applicable for the coupon
    const isValid = products.every(product => {
      if (coupon.applicableCategory && coupon.applicableCategory.toString() !== product.proCategoryId.toString()) {
        return false;
      }
      if (coupon.applicableSubCategory && coupon.applicableSubCategory.toString() !== product.proSubCategoryId.toString()) {
        return false;
      }
      if (coupon.applicableProduct && !product.proVariantId.includes(coupon.applicableProduct.toString())) {
        return false;
      }
      return true;
    });

    if (isValid) {
      return res.json({ success: true, message: "Coupon is applicable for the provided products.", data: coupon });
    } else {
      return res.json({ success: false, message: "Coupon is not applicable for the provided products." });
    }
  }
);


module.exports = {
  getAllCouponCodes,
  getCouponCodeById,
  createCouponCode,
  updateCouponCode,
  deleteCouponCode,
  checkCouponCode,
}