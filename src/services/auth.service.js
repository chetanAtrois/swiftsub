const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const User = require('../models/user.model');
const { responseMessage, userTypes } = require('../constant/constant');

const register = async (userBody) => {

  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.EMAIL_ALREADY_TAKEN)
  }
  if (await User.isPhoneNumberTaken(userBody.phoneNumber)) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.PHONE_NUMBER_ALREADY_TAKEN);
  }
  const createUser = await User.create({
    role: userBody.roleType,
    ...userBody
  });
  return createUser;
}

const login = async (userBody) => {
  const { email, password,userType } = userBody;
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.WRONG_CREDENTIAL_MESSAGE);
  }
  const userpassword = await user.isPasswordMatch(password);
  if (!userpassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.WRONG_CREDENTIAL_MESSAGE);
  }
  return user;
};

const loginUserWithPhoneNumber = async (userBody) => {
  const { phoneNumber, userType } = userBody;
  const users =
    userType === userTypes.USER
      ? await userService.getUserByPhoneNumber(phoneNumber)
      : await driverService.getDriverByPhoneNumber(phoneNumber);
  if (!users) {
    throw new ApiError(httpStatus.UNAUTHORIZED, responseMessage.InCorrectContactNumber_MESSAGE);
  }

  return users;
};

const logout = async (req) => {
  const { refreshToken, email } = req.body;
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.NOT_FOUND);
  }
  await refreshTokenDoc.remove();
};

const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, error.message);
  }
};

const resetPassword = async (resetPasswordToken, userBody) => {
  try {
    const { password,confirmNewPassword, userType } = userBody;
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await checkUserById(resetPasswordTokenDoc.user, userType);
    if (!user) {
      throw new Error(responseMessage.USER_NOT_FOUND);
    }
    await updateUserById(user.id, userType, {password});
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, error.message);
  }
};

const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, responseMessage.EMAIL_VERIFICATION_FAILED);
  }
};

const changePassword = async (req) => {
  try {
    const { currentPassword, newPassword, confirmPassword, userType } = req.body;
    const userId = req.params.id;
    const userRole = req.user;
    console.log('userRole', userRole);
    const user = await checkUserById(userId, userType);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.USER_NOT_FOUND);
    }
    if (userRole.role !== 'admin' && !(await user.isPasswordMatch(currentPassword))) {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.CURRENT_PASSWORD_NOT_MATCH);
    }
    if (newPassword !== confirmPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.PASSWORD_NOT_MATCH);
    }
    const updatedUser = await updateUserById(userId, userType, { password: newPassword })
      
    return updatedUser;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err.message);
  }
};

const checkUserById = async (userId, role) => {
  let userData;
   switch (role) {
     case userTypes.USER:
       userData = await userService.getUserById(userId);
       break;
   }
 
   return userData;
 }

 const updateUserById = async (userId, role, password) => {
  let userData;
   switch (role) {
     case userTypes.USER:
       userData = await userService.updateUserById(userId, password);
       break;
   }
   return userData;
 }

module.exports = {
  register,
  login,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  changePassword,
  loginUserWithPhoneNumber,
};
