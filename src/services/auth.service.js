const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const User = require('../models/user.model');
const { responseMessage, userTypes } = require('../constant/constant');
const Admin = require('../models/admin.model')
const adminService = require('../services/admin.service');

const register = async (userBody) => {
  const { roleType, email, phoneNumber, method, password } = userBody;

  // Validate role
  const normalizedRole = roleType?.toLowerCase();
  if (!['user', 'admin'].includes(normalizedRole)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid role type');
  }

  // Check email uniqueness
  const emailTakenInUser = await User.isEmailTaken(email);
  const emailTakenInAdmin = await Admin.isEmailTaken(email);
  if (emailTakenInUser || emailTakenInAdmin) {
    const existingRole = emailTakenInUser ? 'user' : 'admin';
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Email already registered as ${existingRole}`
    );
  }

  // Check phone uniqueness
  const phoneTakenInUser = await User.isPhoneNumberTaken(phoneNumber);
  const phoneTakenInAdmin = await Admin.isPhoneNumberTaken(phoneNumber);
  if (phoneTakenInUser || phoneTakenInAdmin) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already taken');
  }

  // Validate password (if not Google OAuth)
  if (!method || method !== 'google') {
    if (!password) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
    }
  }

  // Prepare data
  const userData = {
    ...userBody,
    role: normalizedRole,
    userType: normalizedRole, // Explicitly set userType
    ...(method === 'google' && { password: undefined }), // Skip password for Google
  };

  // Create user or admin
  const Model = normalizedRole === 'admin' ? Admin : User;
  const newUser = await Model.create(userData);
  return newUser;
};

const login = async (userBody) => {
  const { email, password, method } = userBody;
  let user = await Admin.findOne({ email }) || await User.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid credentials');
  }

  if (method === 'google') {
    if (user.method !== 'google') {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'This account requires password login'
      );
    }
    return user; 
  }

  if (!password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
  }

  const isPasswordCorrect = await user.isPasswordMatch(password);
  if (!isPasswordCorrect) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid credentials');
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
    const { password, confirmNewPassword } = userBody;

    // Check if the passwords match
    if (password !== confirmNewPassword) {
      throw new Error('Passwords do not match');
    }

    // Get token doc, which includes userType
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    console.log('Token Payload:', resetPasswordTokenDoc);


    const userType = resetPasswordTokenDoc.userType; // <- taken from token

    // Get user details from the token (verify if the user exists)
    const user = await checkUserById(resetPasswordTokenDoc.user, userType);
    if (!user) {
      throw new Error(responseMessage.USER_NOT_FOUND);
    }

    // Update user password (hashing is already handled in `updateUserById`)
    await updateUserById(user.id, userType, { password });

    // Delete the reset password token(s)
    await Token.deleteMany({
      user: user.id,
      type: tokenTypes.RESET_PASSWORD,
    });

    // You could also add a success message or log for confirmation
    console.log('Password reset successfully');

  } catch (error) {
    // Handle any errors (token invalid, user not found, password mismatch, etc.)
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
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.params.id;
    const userRole = req.user; // Comes from auth middleware
    const userType = userRole.userType; // 'admin', 'user', etc.

    console.log('userRole', userRole);

    const user = await checkUserById(userId, userType);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.USER_NOT_FOUND);
    }

    // If user is not an admin, verify current password
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


const checkUserById = async (userId, role) => {
  let userData;
  switch (role) {
    case userTypes.USER:
      userData = await userService.getUserById(userId);
      break;
    case userTypes.ADMIN:
      userData = await adminService.getAdminById(userId);
      break;
    default:
      throw new Error("Invalid user type");
  }

  return userData;
};


 const updateUserById = async (userId, role, password) => {
  let userData;
   switch (role) {
     case userTypes.USER:
       userData = await userService.updateUserById(userId, password);
       break;
       case userTypes.ADMIN:
       userData = await adminService.updateAdminById(userId, password);
       break;
       default:
      throw new Error("Invalid user type");
   }
   return userData;
 };

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
