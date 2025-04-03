const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const User = require('../models/user.model');
const { responseMessage, userTypes } = require('../constant/constant');

/**
 * Register a new user
 * @param {Object} userBody - User registration data
 * @throws {ApiError} If email or phone already exists
 */
const register = async (userBody) => {
  // Validate unique email and phone
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.EMAIL_ALREADY_TAKEN)
  }
  if (await User.isPhoneNumberTaken(userBody.phoneNumber)) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.PHONE_NUMBER_ALREADY_TAKEN);
  }

  // Create user with specified role
  return await User.create({
    role: userBody.roleType,
    ...userBody
  });
}

/**
 * User login with email and password
 * @param {Object} userBody - Contains email, password, and userType
 * @throws {ApiError} If credentials are invalid
 */
const login = async (userBody) => {
  const { email, password, userType } = userBody;
  
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.WRONG_CREDENTIAL_MESSAGE);
  }

  // Verify password match
  const isPasswordValid = await user.isPasswordMatch(password);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.WRONG_CREDENTIAL_MESSAGE);
  }

  return user;
};

module.exports = {
  register,
  login
};