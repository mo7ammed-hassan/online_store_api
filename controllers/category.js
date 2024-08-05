const asyncWrapper = require('../middleWare/asyncWrapper');
const Category = require('../models/category');
const appError = require('../utils/appError');
const HttpStatusText = require('../utils/httpStatusText');
const { uploadCategory } = require('../uploadFile');
const SubCategory = require('../models/subCategory');
const multer = require('multer');


const getCategories = asyncWrapper(
  async (req, res, next) => {
    const categories = await Category.find();
    if (!categories) {
      const error = appError.create("No categories found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Categories retrieved successfuly ", data: categories });
  }
);

const getCategoryById = asyncWrapper(
  async (req, res, next) => {
    const categoryID = await Category.findById(req.params.id);
    if (!categoryID) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.json({ success: true, message: "Category retrieved successfuly ", data: category });
  }
)

const addCategory = asyncWrapper(
  async (req, res, next) => {
    uploadCategory.single('img')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        if (err.message == 'LIMIT_FILE_SIZE') {
          err.message = 'File size is too large. maximum file size is 5MB.'
        }
        return res.status(400).json({ success: false, message: err });
      } else if (err) {
        return res.status(400).json({ success: false, message: 'Error occurred while uploading file' });
      }
      const { name } = req.body;
      let imageUrl = 'no_url';
      if (req.file) {
        imageUrl = `http://localhost:3000/image/category/${req.file.filename}`;;
      }
      console.log(req.file);
      if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }

      try {
        const newCategory = new Category({
          name: name,
          image: imageUrl
        });
        await newCategory.save();
        res.json({ success: true, message: "Category created successfully.", data: null });
      } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ success: false, message: error.message });
      }
    });
  }
);

const updateCategory = asyncWrapper(
  async (req, res, next) => {
    const categoryID = req.params.id;
    uploadCategory.single('img')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          err.message = 'File size is too large. Maximum filesize is 5MB.';
        }
        console.log(`Update category: ${err.message}`);
        return res.json({ success: false, message: err.message });
      } else if (err) {
        console.log(`Update category: ${err.message}`);
        return res.json({ success: false, message: err.message });
      }

      const { name } = req.body;
      let image = req.body.image;

      if (req.file) {
        image = `http://localhost:3000/image/category/${req.file.filename}`;
      }

      if (!name || !image) {
        return res.status(400).json({ success: false, message: "Name and image are required." });
      }

      try {
        const updatedCategory = await Category.findByIdAndUpdate(categoryID, { name: name, image: image }, { new: true });
        if (!updatedCategory) {
          return res.status(404).json({ success: false, message: "Category not found." });
        }
        res.json({ success: true, message: "Category updated successfully.", data: null });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }

    });
  }
);

const deleteCategory = asyncWrapper(
  async (req, res, next) => {
    const categoryID = req.params.id;

    // Check if any subcategories reference this category
    const subcategories = await SubCategory.find({ categoryId: categoryID });
    if (subcategories.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete category. Subcategories are referencing it." });
    }

    // Check if any products reference this category
    const products = await Product.find({ proCategoryId: categoryID });
    if (products.length > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete category. Products are referencing it." });
    }

    // If no subcategories or products are referencing the category, proceed with deletion
    const category = await Category.findByIdAndDelete(categoryID);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    res.json({ success: true, message: "Category deleted successfully." });
  }
);

module.exports = {
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};