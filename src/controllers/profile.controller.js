const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user.model');
const profileService = require('../services/profile.service');
const userService = require('../services/user.service');
const adminService = require('../services/admin.service');


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
  const updated= await adminService.updateUserByQuery(req);
  res.status(httpStatus.OK).send({ success: true, updated });
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
  const {userId} = req.query;
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


const searchUser = catchAsync(async (req, res) => {
  const { query } = req.query;
  const user = await userService.searchUsers(query);
  
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  res.status(200).send({ message: 'User found', data: user });
});



module.exports = {
  getUsersList,
  getUserProfileByQuery,
  updateUserByQuery,
  deleteUserByQuery,
  getProfileByQuery,
  updateProfileByQuery,
  searchUser,
};

