const express = require('express');
const router = express.Router();
const posterController = require('../controllers/poster');

router.route('/')
  .get(posterController.getAllPosters)
  .post(posterController.createPoster)

router.route('/:id')
  .get(posterController.getPosterById)
  .put(posterController.updatePoster)
  .delete(posterController.deletePoster);


module.exports = router;

