const Brand = require('../models/brand');
const asyncWrapper = require('../middleWare/asyncWrapper');
const AppError = require('../utils/appError');
const HttpStatusText = require('../utils/httpStatusText');

const getAllBrands = asyncWrapper(
  async (req, res, next) => {
    const brands = await Brand.find().populate('subcategoryId').sort({ 'subcategoryId': 1 });
    if (!brands) {
      const error = AppError.create('No brands found', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Brands retrieved successfully.', data: brands });
  }
);

const getBrandById = asyncWrapper(
  async (req, res, next) => {
    const brand = await Brand.findById(req.params.id).populate('subcategoryId');
    if (!brand) {
      const error = AppError.create('No brand found', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Brand retrieved successfully.', data: brand });
  }
);

const createBrand = asyncWrapper(
  async (req, res, next) => {
    const { name, subcategoryId } = req.body;
    if (!name || !subcategoryId) {
      const error = AppError.create('Name and subcategoryId are required', 400, HttpStatusText.FAIL);
      return next(error);
    }
    const newBrand = new Brand({ name: name, subcategoryId: subcategoryId });
    await newBrand.save();
    return res.status(201).json({ success: true, message: 'Brand created successfully.', data: null });
  }
);

const updateBrand = asyncWrapper(
  async (req, res, next) => {
    const brandID = req.params.id;
    const { name, subcategoryId } = req.body;
    if (!name || !subcategoryId) {
      const error = AppError.create('Name and subcategoryId are required', 400, HttpStatusText.FAIL);
      return next(error);
    }
    const updatedBrand = await Brand.findByIdAndUpdate(brandID, { name: name, subcategoryId: subcategoryId }, { new: true });
    if (!updatedBrand) {
      const error = AppError.create('No brand found with that ID', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Brand updated successfully.', data: updatedBrand });
  }
);

const deleteBrand = asyncWrapper(
  async (req, res, next) => {
    const brandID = req.params.id;
    const products = await Product.find({ proBroductId: brandID }); // if products contains any brnad that contains this id
    if (products.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete brand. Products are referencing it." });
    }

    const brand = await Brand.findByIdAndDelete(brandID);
    if (!brand) {
      const error = AppError.create('No brand found with that ID', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Brand deleted successfully.', data: null });

  }
);

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
}