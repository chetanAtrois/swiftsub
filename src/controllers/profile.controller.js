const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user.model');
const profileService = require('../services/profile.service');


const getUsersList = catchAsync(async (req, res) => {
  const users = await User.find().select('firstName lastName email _id'); 
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Users list fetched successfully',
    users,
  });
});


const getUserProfileByQuery = catchAsync(async (req, res) => {
  const userId = req.query.id;
  if (!userId) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'User ID is required' });
  }

  const user = await User.findById(userId).select('firstName lastName email _id');
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'User not found' });
  }

  res.status(httpStatus.OK).send({ success: true, message: 'User profile fetched successfully', user });
});


const updateUserByQuery = catchAsync(async (req, res) => {
  const userId = req.query.id;
  const updateBody = req.body;
  if (!userId) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'User ID is required' });
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateBody, { new: true }).select('firstName lastName email _id');
  if (!updatedUser) {
    return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'User not found' });
  }

  res.status(httpStatus.OK).send({ success: true, message: 'User updated successfully', user: updatedUser });
});


const deleteUserByQuery = catchAsync(async (req, res) => {
  const userId = req.query.id;
  if (!userId) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'User ID is required' });
  }

  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    return res.status(httpStatus.NOT_FOUND).send({ success: false, message: 'User not found' });
  }

  res.status(httpStatus.OK).send({ success: true, message: 'User deleted successfully' });
});


const getProfileByQuery = catchAsync(async (req, res) => {
  const userId = req.query.id;
  if (!userId) return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'User ID is required' });

  const user = await profileService.getProfile(userId, 'admin');
  const filteredUser = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    id: user._id || user.id,
  };

  res.status(httpStatus.OK).send({ success: true, message: 'Profile fetched successfully', user: filteredUser });
});

const updateProfileByQuery = catchAsync(async (req, res) => {
  const userId = req.query.id;
  if (!userId) return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: 'User ID is required' });

  const updatedUser = await profileService.updateProfile(userId, 'admin', req.body);
  const filteredUser = {
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    id: updatedUser._id || updatedUser.id,
  };

  res.status(httpStatus.OK).send({ success: true, message: 'Profile updated successfully', user: filteredUser });
});

module.exports = {
  getUsersList,
  getUserProfileByQuery,
  updateUserByQuery,
  deleteUserByQuery,
  getProfileByQuery,
  updateProfileByQuery,
};

