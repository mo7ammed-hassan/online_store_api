const User = require('../models/user');
const asyncWrapper = require('../middleWare/asyncWrapper');
const HttpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const bcrypt = require('bcryptjs');

const gelAllUsers = asyncWrapper(
  async (req, res, next) => {
    const users = await User.find();
    if (!users) {
      const error = AppError.create("No users found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "Users retrieved successfully.", data: users });
  }
);

const getUserByEmail = asyncWrapper(
  async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
      const error = AppError.create("Email is required", 400, HttpStatusText.FAIL)
      return next(error);
    }
    const user = await User.findOne({ email });
    if (!user) {
      const error = AppError.create("User not found", 404, HttpStatusText.FAIL)
      return next(error);
    }
    return res.json({ success: true, message: "User retrieved successfully.", data: user });
  }
);

// login user
const loginUser = asyncWrapper(async (req, res, next) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = AppError.create(!user ? 'user not exist' : 'wrong password', 401, HttpStatusText.FAIL);
    return next(error);
  }
  //const token = await generateJWT({ email: user.email, id: user.id, role: user.role });
  res.status(200).json({ success: true, message: "Login successful.", data: user });
});


// register user
const registerUser = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;
  const users = await User.findOne({ email: req.body.email });
  if (users) {
    const error = AppError.create('Email already exists', 400, HttpStatusText.FAIL);
    return next(error);
  }
  // password hashing 
  const hashedPassword = await bcrypt.hash(password, 8);
  const newUser = new User({
    name: name,
    email: email,
    password: hashedPassword,
    created_at: new Date(),
  });
  await newUser.save();

  res.json({ success: true, message: "User created successfully.", data: null });
});


const updateUser = asyncWrapper(
  async (req, res, next) => {
    const { userEmail } = req.params.email;
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      const error = AppError.create(!name ? 'Name is required' : !email ? 'email is requried' : 'password is required', 400, HttpStatusText.FAIL);
      return next(error);
    }
    // hashed password
    const hashedPassword = await bcrypt.hash(password, 8);
    // update user
    const user = await User.findOneAndUpdate(
      userEmail,
      { name, hashedPassword },
      { new: true }
    );

    if (!user) {
      const error = AppError.create('No user found with that email', 404, HttpStatusText.FAIL);
      return next(error);
    }

    return res.json({ success: true, message: "User updated successfully.", data: user });
  }
);

const deleteUser = asyncWrapper(
  async (req, res, next) => {
    const { userEmail } = req.params.email;

    const user = await User.findOneAndDelete(userEmail);
    if (!user) {
      const error = AppError.create('No user found with that email', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: "User deleted successfully." });
  }
);

module.exports = {
  gelAllUsers,
  getUserByEmail,
  loginUser,
  registerUser,
  updateUser,
  deleteUser,
};