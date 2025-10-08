const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const User = require('../models/user.model');
const admin = require('../models/admin.model');
const { responseMessage, userTypes } = require('../constant/constant');
const { UserRecord } = require('firebase-admin/auth');
const { isVerified } = require('../validations/auth.validation');
const { successHandler } = require('../config/morgan');

const updateUserByQuery = async (requestBody) => {
  const { userId } = requestBody.query; // get userId from query
  console.log("UserId:", userId);

  if (!userId) {
    throw new Error('User ID is required');
  }

  const isUserExists = await User.findById(userId);
  if (!isUserExists) {
    throw new Error('User not found');
  }

  const updateData = {
    ...requestBody.body,
  };

  const updatedUser = await User.findByIdAndUpdate(
    { _id: userId },     // filter
    updateData,          // update object
    { new: true, runValidators: true } // return updated doc & validate
  ).select('-password'); // exclude password

  console.log('Updated User:', updatedUser);

  return { updatedUser };
};


module.exports={
    updateUserByQuery
}