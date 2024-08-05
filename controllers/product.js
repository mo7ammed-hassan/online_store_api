const Product = require('../models/product');
const asyncWrapper = require('../middleWare/asyncWrapper');
const httpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const { uploadProduct } = require('../uploadFile');
const multer = require('multer');

const getAllProducts = asyncWrapper(
  async (req, res, next) => {
    const products = await Product.find()
      .populate('proCategoryId', 'id name')
      .populate('proSubCategoryId', 'id name')
      .populate('proBrandId', 'id name')
      .populate('proVariantTypeId', 'id name')
      .populate('proVariantId', 'id name')

    if (!products) {
      const error = AppError.create("No product found", 404, httpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Products retrieved successfully.", data: products });;
  }
);

const getProductById = asyncWrapper(
  async (req, res, next) => {
    const product = await Product.findById(req.params.id)
      .populate('proCategoryId', 'id name')
      .populate('proSubCategoryId', 'id name')
      .populate('proBrandId', 'id name')
      .populate('proVariantTypeId', 'id name')
      .populate('proVariantId', 'id name')

    if (!product) {
      const error = AppError.create("No product found", 404, httpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Product retrieved successfully.", data: product });
  }
);

const createProduct = asyncWrapper(
  async (req, res, next) => {
    // Execute the Multer middleware to handle multiple file fields
    uploadProduct.files([
      { name: 'image1', maxCount: 1 },
      { name: 'image2', maxCount: 1 },
      { name: 'image3', maxCount: 1 },
      { name: 'image4', maxCount: 1 },
      { name: 'image5', maxCount: 1 }
    ])(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // Handle Multer errors, if any
        if (err.code === 'LIMIT_FILE_SIZE') {
          err.message = 'File size is too large. Maximum filesize is 5MB per image.';
        }
        console.log(`Add product: ${err}`);
        return res.json({ success: false, message: err.message });
      } else if (err) {
        // Handle other errors, if any
        console.log(`Add product: ${err}`);
        return res.json({ success: false, message: err });
      }

      // Extract product data from the request body
      const { name, description, quantity, price, offerPrice, proCategoryId, proSubCategoryId, proBrandId, proVariantTypeId, proVariantId } = req.body;


      // Check if any required fields are missing
      if (!name || !quantity || !price || !proCategoryId || !proSubCategoryId) {
        return res.status(400).json({ success: false, message: "Required fields are missing." });
      }

      // Initialize an array to store image URLs
      const imageUrls = [];
      const fields = ['image1', 'image2', 'image3', 'image4', 'image5'];
      // Loop through the fields and add the image URLs to the array
      fields.forEach((field, index) => {
        if (req.files[field] && req.files[field].length > 0) {
          const file = req.files[field][0];
          const imageUrl = `http://localhost:3000/image/products/${file.filename}`;
          imageUrls.push({ image: index + 1, url: imageUrl });
        }
      });

      // Create a new product object with data
      const newProduct = new Product({ name, description, quantity, price, offerPrice, proCategoryId, proSubCategoryId, proBrandId, proVariantTypeId, proVariantId, images: imageUrls });

      // Save the new product to the database
      await newProduct.save();
      return res.status(201).json({ success: true, message: "Product created successfully.", data: newProduct });
    })
  }
);


const updateProduct = asyncWrapper(
  async (req, res, next) => {
    const productId = req.params.id;
    uploadProduct.fields([
      { name: 'image1', maxCount: 1 },
      { name: 'image2', maxCount: 1 },
      { name: 'image3', maxCount: 1 },
      { name: 'image4', maxCount: 1 },
      { name: 'image5', maxCount: 1 }
    ])(req, res, async function (err) {
      if (err) {
        console.log(`Update product: ${err}`);
        return res.status(500).json({ success: false, message: err.message });
      }

      const { name, description, quantity, price, offerPrice, proCategoryId, proSubCategoryId, proBrandId, proVariantTypeId, proVariantId } = req.body;

      // Find the product by ID
      const productToUpdate = await Product.findById(productId);
      if (!productToUpdate) {
        return res.status(404).json({ success: false, message: "Product not found." });
      }

      // Update product properties if provided
      productToUpdate.name = name || productToUpdate.name;
      productToUpdate.description = description || productToUpdate.description;
      productToUpdate.quantity = quantity || productToUpdate.quantity;
      productToUpdate.price = price || productToUpdate.price;
      productToUpdate.offerPrice = offerPrice || productToUpdate.offerPrice;
      productToUpdate.proCategoryId = proCategoryId || productToUpdate.proCategoryId;
      productToUpdate.proSubCategoryId = proSubCategoryId || productToUpdate.proSubCategoryId;
      productToUpdate.proBrandId = proBrandId || productToUpdate.proBrandId;
      productToUpdate.proVariantTypeId = proVariantTypeId || productToUpdate.proVariantTypeId;
      productToUpdate.proVariantId = proVariantId || productToUpdate.proVariantId;

      // Iterate over the file fields to update images
      const fields = ['image1', 'image2', 'image3', 'image4', 'image5'];
      fields.forEach((field, index) => {
        if (req.files[field] && req.files[field].length > 0) {
          const file = req.files[field][0];
          const imageUrl = `http://localhost:3000/image/products/${file.filename}`;
          // Update the specific image URL in the images array
          let imageEntry = productToUpdate.images.find(img => img.image === (index + 1));
          if (imageEntry) {
            imageEntry.url = imageUrl;
          } else {
            // If the image entry does not exist, add it
            productToUpdate.images.push({ image: index + 1, url: imageUrl });
          }
        }
      });

      // Save the updated product
      await productToUpdate.save();
      res.json({ success: true, message: "Product updated successfully." });
    });
  }
);


const deleteProduct = asyncWrapper(
  async (req, res, next) => {
    const productID = req.params.id;
    const product = await Product.findByIdAndDelete(productID);
    if (!product) {
      const error = AppError.create("Product not found.", 404, httpStatusText.FAIL)
      return next(error);
    }
    res.json({ success: true, message: "Product deleted successfully." });
  }
);

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}