const asyncWrapper = require('../middleWare/asyncWrapper');
const SubCategory = require('../models/subCategory');
const AppError = require('../utils/appError');
const Product = require('../models/product');
const Brand = require('../models/brand');

const getSubCategories = asyncWrapper(
  async (req, res) => {
    const subCategories = await SubCategory.find().populate('categoryId').sort({ 'categoryId': 1 });

    if (!subCategories) {
      const error = AppError.create("No subCategory found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Sub-categories retrieved successfully.", data: subCategories });;
  }
);

const getSubCategoryById = asyncWrapper(
  async (req, res, next) => {
    const subCategory = await SubCategory.findById(req.params.id).populate('categoryId');
    if (!subCategory) {
      const error = AppError.create("No subCategory found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "subCategory retrieved successfuly ", data: subCategory });
  }
);

const addSubCategory = asyncWrapper(
  async (req, res, next) => {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
      const error = AppError.create("Name and Category ID are required", 404, HttpStatusText.FAIL)
      return next(error);
    }
    const newsubCategory = await SubCategory({ name, categoryId });
    await newsubCategory.save();
    return res.status(201).json({ success: true, message: "subCategory added successfuly ", data: newsubCategory });
  }
);

const updateSubCategory = asyncWrapper(
  async (req, res, next) => {
    const subCategoryID = req.params.id;
    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
      const error = AppError.create("Name and Category ID are required", 404, HttpStatusText.FAIL)
      return next(error);
    }

    const updatedsubCategory = await SubCategory.findByIdAndUpdate(subCategoryID, { name, categoryId }, { new: true });
    if (!updatedsubCategory) {
      const error = AppError.create("No category found with that ID", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "subCategory updated successfuly ", data: updatedsubCategory });
  }
);

const deleteSubCategory = asyncWrapper(
  async (req, res, next) => {
    const subCategoryID = req.params.id;

    try {
      // Check if any brand is associated with the sub-category
      const brandCount = await Brand.countDocuments({ subCategoryId: subCategoryID });
      if (brandCount > 0) {
        return res.status(400).json({ success: false, message: "Cannot delete sub-category. It is associated with one or more brands" });
      }

      // Check if any products reference this sub-category
      const products = await Product.find({ prosubCategoryId: subCategoryID });
      if (products.length > 0) {
        return res.status(400).json({ success: false, message: "Cannot delete sub-category. Products are referencing it." });
      }

      // If no brands or products are associated, proceed with deletion of the sub-category
      const subCategory = await SubCategory.findByIdAndDelete(subCategoryID);
      if (!subCategory) {
        return res.status(404).json({ success: false, message: "Sub-category not found." });
      }
      res.json({ success: true, message: "Sub-category deleted successfully." });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }

  }
);

module.exports = {
  getSubCategories,
  getSubCategoryById,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
}