const Poster = require('../models/poster');
const asyncWrapper = require('../middleWare/asyncWrapper');
const AppError = require('../utils/appError');
const HttpStatusText = require('../utils/httpStatusText');
const { uploadPosters } = require('../uploadFile');
const multer = require('multer');

const getAllPosters = asyncWrapper(
  async (req, res, next) => {
    const posters = await Poster.find();
    if (!posters) {
      const error = AppError.create("No posters found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Posters retrieved successfully.", data: posters });
  }
);

const getPosterById = asyncWrapper(
  async (req, res, next) => {
    const poster = await Poster.findById(req.params.id);
    if (!poster) {
      const error = AppError.create("No poster found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Poster retrieved successfully.", data: poster });
  }
);


const createPoster = asyncWrapper(
  async (req, res, next) => {
    // upload iamge>>
    uploadPosters.single('img')(req, res, async function (err) {
      // check if error type of multter error
      if (err instanceof multer.MulterError) {
        // check if error is file too large
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'Image file size exceeds the limit' });
        }
      } else if (err) {
        return res.status(400).json({ success: false, message: 'Error occurred while uploading image' });
      }
      // pass poster name from client
      const { posterName } = req.body;
      let imageUrl = 'no-url';
      // if file exists, set imageUrl to its path
      if (req.file) {
        imageUrl = `http://localhost:3000/image/poster/${req.file.filename}`
      }
      // if name is not specified from req
      if (!posterName) {
        const error = AppError.create("Poster name is required", 400, HttpStatusText.FAIL)
        return next(error);
      }

      // create poster
      const newPoster = new Poster({
        posterName: posterName,
        imageUrl: imageUrl,
      });
      await newPoster.save();

      return res.status(201).json({ success: true, message: "Poster created successfully.", data: newPoster });

    })
  }
);


const updatePoster = asyncWrapper(
  async (req, res, next) => {
    const posterID = req.params.id;
    uploadPosters.single('img')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // check if error is file too large
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'Image file size exceeds the limit' });
        }
      } else if (err) {
        return res.status(400).json({ success: false, message: 'Error occurred while uploading image' });
      }
      // pass poster name from client
      const { posterName } = req.body;
      let imageUrl = 'no-url';
      // if file exists, set imageUrl to its path
      if (req.file) {
        imageUrl = `http://localhost:3000/image/poster/${req.file.filename}`
      }
      if (!posterName || !imageUrl) {
        const error = AppError.create("Poster name and image URL are required", 400, HttpStatusText.FAIL)
        return next(error);
      }
      // find and update poster
      const updatedPoster = await Poster.findByIdAndUpdate(posterID, { posterName: posterName, imageUrl: imageUrl }, { new: true });
      if (!updatedPoster) {
        const error = AppError.create("No poster found with that ID", 404, HttpStatusText.FAIL)
        return next(error);
      }
      return res.json({ success: true, message: "Poster updated successfully.", data: updatedPoster });
    })
  }
);


const deletePoster = asyncWrapper(
  async (req, res, next) => {
    const posterID = req.params.id;
    const poster = await Poster.findByIdAndDelete(posterID);
    if (!poster) {
      const error = AppError.create("No poster found with that ID", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Poster deleted successfully." });
  }
);

module.exports = {
  getAllPosters,
  getPosterById,
  createPoster,
  updatePoster,
  deletePoster,
};
