const VariantType = require('../models/variantType');
const asyncWrapper = require('../middleWare/asyncWrapper');

const getAllVariantType = asyncWrapper(
  async (req, res, next) => {
    const variantTypes = await VariantType.find({}, { '__v': false });
    if (!variantTypes) {
      const error = appError.create("No variantTypes found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    res.json({ success: true, message: 'Variant types fetched successfully', data: variantTypes });
  }
);

const getVariantTypeById = asyncWrapper(
  async (req, res, next) => {
    const variantType = await VariantType.findById(req.params.id);
    if (!variantType) {
      const error = AppError.create("No variantType found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    res.json({ success: true, message: 'VariantType fetched successfully', data: variantType });
  }
);

const addVariantType = asyncWrapper(
  async (req, res, next) => {
    const { name, type } = req.body;
    if (!name) {
      const error = appError.create("Name is required", 400, HttpStatusText.FAIL)
      return next(error);
    }
    const newVariantType = new VariantType({
      name,
      type
    });
    await newVariantType.save();
    res.status(201).json({ success: true, message: 'VariantType added successfully', data: newVariantType });
  }
);


const updateVariantType = asyncWrapper(
  async (req, res, next) => {
    const variantTypeID = req.params.id;
    const { name, type } = req.body;
    if (!name) {
      const error = appError.create("Name is required", 400, HttpStatusText.FAIL)
      return next(error);
    }

    const updateVariantType = await VariantType.findByIdAndUpdate(variantTypeID, { name: name, type: type }, { new: true });

    if (!updateVariantType) {
      const error = appError.create("No variantType found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    res.json({ success: true, message: 'VariantType updated successfully', data: updateVariantType });
  }
);

const deleteVariantType = asyncWrapper(
  async (req, res, next) => {
    const variantTypeID = req.params.id;
    // Check if any variant is associated with this variant type
    const variantCount = await Variant.countDocuments({ variantTypeId: variantTypeID });
    if (variantCount > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete variant type. It is associated with one or more variants" });
    }

    // Check if any products reference this variant type
    const products = await Product.find({ proVariantTypeId: variantTypeID });
    if (products.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete variant type. Products are referencing it." });
    }
    // If no variants or products are associated, proceed with deletion of the variant type
    const variantType = await VariantType.findByIdAndDelete(variantTypeID);
    if (!variantType) {
      const error = appError.create("Variant type not found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    res.json({ success: true, message: 'Variant type deleted successfully' });
  }
);

module.exports = {
  getAllVariantType,
  getVariantTypeById,
  addVariantType,
  updateVariantType,
  deleteVariantType,
};

