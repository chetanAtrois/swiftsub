const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const admin = require('../models/admin.model');
const { responseMessage, userTypes } = require('../constant/constant');

const getProfile = async (userId, userType) => {
  let user;
  switch (userType) {
    case userTypes.ADMIN:
      user = await admin.findById(userId).select('-password');
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user type');
  }

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.USER_NOT_FOUND);
  }
  return user;
};

const updateProfile = async (userId, userType, updateBody) => {
  let updatedUser;
  switch (userType) {
    case userTypes.ADMIN:
      updatedUser = await admin.findByIdAndUpdate(userId, updateBody, { new: true }).select('-password');
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user type');
  }

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.USER_NOT_FOUND);
  }
  return updatedUser;
};



module.exports = {
  getProfile,
  updateProfile,
};
