const httpStatus = require('http-status');
const tokenService = require('./token.service.js');
const userService = require('./user.service.js');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const User = require('../models/user.model');
const { responseMessage, userTypes } = require('../constant/constant');

// ✅ role-based helpers
const checkUserById = async (userId, role) => {
  let userData;
  switch (role) {
    case userTypes.USER:
    case userTypes.ADMIN:
      userData = await userService.getUserById(userId);
      break;
    default:
      throw new Error("Invalid user type");
  }
  return userData;
};

const updateUserById = async (userId, role, payload) => {
  let userData;
  switch (role) {
    case userTypes.USER:
    case userTypes.ADMIN:
      userData = await userService.updateUserById(userId, payload);
      break;
    default:
      throw new Error("Invalid user type");
  }
  return userData;
};

const checkUserByEmail = async (email, role) => {
  let userData;
  switch (role) {
    case userTypes.USER:
    case userTypes.ADMIN:
      userData = await userService.getUserByEmail(email);
      break;
    default:
      throw new Error("Invalid user type");
  }
  return userData;
};

// ----------------------------------------------------

const register = async (userBody) => {
  const { email, fcmToken } = userBody;

  const emailTakenInUser = await User.isEmailTaken(email);
  if (emailTakenInUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Email already registered as another user`);
  }

  const userData = {
    ...userBody,
    fcmToken,
  };

  const newUser = await User.create(userData);
  return newUser;
};

// const registerSecondStep = async (req, userBody) => {
//   const { userId } = req.query;
//   const user = await User.findOne({ _id: userId });
//   if (!user) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
//   }
//   const updatedUser = await User.findByIdAndUpdate(
//     userId,
//     { $set: userBody },
//     { new: true }
//   );
//   return updatedUser;
// };

const login = async (userBody) => {
  const { email, password, fcmToken, roleType } = userBody;

  let user = await checkUserByEmail(email, roleType);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid credentials');
  }

  if (!password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
  }

  const isPasswordCorrect = await user.isPasswordMatch(password);
  if (!isPasswordCorrect) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid credentials');
  }

  user.fcmToken = fcmToken;
  await user.save();
  return user;
};

const getUsersById = async (req) => {
  const userExist = await User.findOne({ _id: req.user._id });
  if (!userExist) {
    throw new Error('User does not exist');
  }
  const id = req.body.id;
  if (!Array.isArray(id) || id.length === 0) {
    throw new Error('Please provide a valid array of user IDs in the body.');
  }
  const usersFromUser = await User.find({ _id: { $in: id } });
  // ⚠️ subAdmin not defined in your code, left as-is
  const usersFromSubAdmin = await subAdmin.find({ _id: { $in: id } });
  const allUsers = [...usersFromUser, ...usersFromSubAdmin];

  return allUsers;
};

const logout = async (req) => {
  const { refreshToken, email, roleType } = req.body;

  const user = await checkUserByEmail(email, roleType);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userId = user._id;
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.NOT_FOUND);
  }
  await refreshTokenDoc.remove();
  await User.findOneAndUpdate({ _id: userId }, { $set: { fcmToken: null } });
  return {
    message: 'User logged out successfully',
  };
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
    const { password, confirmNewPassword } = userBody;
    if (password !== confirmNewPassword) {
      throw new Error('Passwords do not match');
    }
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    const userType = resetPasswordTokenDoc.userType;

    const user = await checkUserById(resetPasswordTokenDoc.user, userType);
    if (!user) {
      throw new Error(responseMessage.USER_NOT_FOUND);
    }

    await updateUserById(user.id, userType, { password });
    await Token.deleteMany({
      user: user.id,
      type: tokenTypes.RESET_PASSWORD,
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, error.message);
  }
};

const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(
      verifyEmailToken,
      tokenTypes.VERIFY_EMAIL
    );
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
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.params.id;
    const userRole = req.user;
    const userType = userRole.userType;

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
    const updatedUser = await updateUserById(userId, userType, { password: newPassword });
    return updatedUser;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err.message);
  }
};

// ----------------------------------------------------

module.exports = {
  register,
  // registerSecondStep,
  login,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  changePassword,
  getUsersById,
};
