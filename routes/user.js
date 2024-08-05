const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');


router.route('/').get(userController.gelAllUsers);

router.route('/:email')
  .get(userController.getUserByEmail)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

router.route('/register').post(userController.registerUser);

router.route('/login').post(userController.loginUser);

module.exports = router;