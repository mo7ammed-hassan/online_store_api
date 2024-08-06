const Variant = require('../models/variant');
const asyncWrapper = require('../middleWare/asyncWrapper');
const HttpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const Product = require('../models/product');

const getAllVariant = asyncWrapper(
  async (req, res) => {
    const variants = await Variant.find({}, { '__v': false }).populate('variantTypeId').sort({ 'variantTypeId': 1 });
    if (!variants) {
      const error = AppError.create("No variants found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Variants retrieved successfully.", data: variants });
  }
);

const getVariantById = asyncWrapper(
  async (req, res) => {
    const variant = await Variant.findById(req.params.id).populate('variantTypeId');
    if (!variant) {
      const error = AppError.create("No variant found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Variant retrieved successfully.", data: variant });
  }
);

const addVariant = asyncWrapper(
  async (req, res) => {
    const { name, variantTypeId } = req.body;
    if (!variantTypeId || !name) {
      const error = AppError.create("Missing required fields", 400, HttpStatusText.FAIL);
      return next(error);
    }
    const newVariant = new Variant({
      name, variantTypeId
    });
    await newVariant.save();
    return res.json({ success: true, message: "Variant added successfully.", data: newVariant });
  }
);

const updateVariant = asyncWrapper(
  async (req, res) => {
    const variantID = req.params.id;
    const { name, variantTypeId } = req.body;
    if (!variantTypeId || !name) {
      const error = AppError.create("Missing required fields", 400, HttpStatusText.FAIL);
      return next(error);
    }

    const updateVariant = await Variant.findByIdAndUpdate(variantID, { name, variantTypeId }, { new: true });

    if (!updateVariant) {
      const error = AppError.create("No variant found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Variant updated successfully.", data: updateVariant });
  }
);

const deleteVariant = asyncWrapper(
  async (req, res) => {
    const variantID = req.params.id;

    // Check if any products reference this variant
    const products = await Product.find({ proVariantId: variantID });
    if (products.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete variant. It is associated with one or more products" });
    }

    // If no products are referencing the variant, proceed with deletion
    const variant = await Variant.findByIdAndDelete(variantID);
    if (!variant) {
      const error = AppError.create("No variant found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Variant deleted successfully." });

  }
);

module.exports = {
  getAllVariant,
  getVariantById,
  addVariant,
  updateVariant,
  deleteVariant,
}