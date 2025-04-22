const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const adminService = require('./admin.service');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { userTypes } = require('../constant/constant');
const generateToken = (userId, userType, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    userType,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  console.log('payload122', payload, 'secreteeee', secret);
  return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

const verifyToken = async (token, type) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);  // Decode the token
    console.log('Decoded Token:', payload);  // Optional: Debug log

    const tokenDoc = await Token.findOne({
      token,
      type,
      user: payload.sub,
      blacklisted: false,
    });

    if (!tokenDoc) {
      throw new Error('Token not found or it has been blacklisted');
    }

    // ✅ Attach userType from payload to tokenDoc manually
    tokenDoc.userType = payload.userType;

    return tokenDoc;
  } catch (error) {
    throw new Error('Token verification failed: ' + error.message);
  }
};



const generateAuthTokens = async (user, userType) => {
  console.log('suyeyee899', user);
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, userType, accessTokenExpires, tokenTypes.ACCESS);
  console.log('accessToken12', accessToken);
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, userType, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

const generateResetPasswordToken = async (userBody) => {
  const user = await checkUserByEmail(userBody.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, user.userType, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

const checkUserByEmail = async (email) => {
  let userData = await userService.getUserByEmail(email);

  // If user not found, check in admin
  if (!userData) {
    userData = await adminService.getAdminByEmail(email);
    
    if (!userData) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'No user or admin found with this email'
      );
    }
  }

  return userData; // Can be user or admin, based on where found
};


module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  checkUserByEmail,
};
