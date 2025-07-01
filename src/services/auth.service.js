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
const Company = require('../models/company.model');
const employeeActivityModel = require('../models/employeeActivity.model');
const {uploadFile} = require('../config/upload-image');
const subAdmin = require('../models/subAdmin.model');

const register = async (userBody) => {
  const { roleType, email, phoneNumber, method, password ,fcmToken} = userBody;
  console.log("userBody",userBody);

  const normalizedRole = roleType?.toLowerCase();
  if (!['user', 'admin'].includes(normalizedRole)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid role type');
  }

  const emailTakenInUser = await User.isEmailTaken(email);
  const emailTakenInAdmin = await Admin.isEmailTaken(email);
  if (emailTakenInUser || emailTakenInAdmin) {
    const existingRole = emailTakenInUser ? 'user' : 'admin';
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Email already registered as ${existingRole}`
    );
  }

  const phoneTakenInUser = await User.isPhoneNumberTaken(phoneNumber);
  const phoneTakenInAdmin = await Admin.isPhoneNumberTaken(phoneNumber);
  if (phoneTakenInUser || phoneTakenInAdmin) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already taken');
  }

  if (!method || method !== 'google') {
    if (!password) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
    }
  }

  const userData = {
    ...userBody,
    role: normalizedRole,
    userType: normalizedRole, 
    fcmToken,
    ...(method === 'google' && { password: undefined }), 
  };

  const Model = normalizedRole === 'admin' ? Admin : User;
  const newUser = await Model.create(userData);
  return newUser;
};

const login = async (userBody) => {
  const { email, password, method, fcmToken } = userBody;
  let user = await Admin.findOne({ email }) || await User.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid credentials');
  }

  if (method === 'google') {
    if (user.method !== 'google') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'This account requires password login');
    }

    user.fcmToken = fcmToken;
    await user.save();
    return user;
  }

  if (!password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
  }

  const isPasswordCorrect = await user.isPasswordMatch(password);
  if (!isPasswordCorrect) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid credentials');
  }

  // ✅ Update FCM token for password login
  user.fcmToken = fcmToken;
  await user.save();

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

const getUserByPhoneNumber = async (req) => {
  const userExist = await User.findOne({
    _id:req.user._id
  })
  if(!userExist){
    throw new Error('User does not exist')
  }
  const {phoneNumber} = req.query;
  let user = await User.findOne({phoneNumber:phoneNumber});
  if(!user){
  user = await subAdmin.findOne({phoneNumber:phoneNumber})}
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
  const usersFromSubAdmin = await subAdmin.find({ _id: { $in: id } });

  const allUsers = [...usersFromUser, ...usersFromSubAdmin];

  return allUsers;
};

const logout = async (req) => {
  const { refreshToken } = req.body;
  const userId = req.user._id; 

  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.NOT_FOUND);
  }

  await refreshTokenDoc.remove();
  await User.findOneAndUpdate({_id: userId}, {$set: {fcmToken: null}});
  const activeCheckIn = await employeeActivityModel.findOne({
    employeeId: userId,
    status: "checked-in",
  });

  if (activeCheckIn) {
    const timeDiffInMilliseconds = new Date() - new Date(activeCheckIn.checkInTime);
    const timeDiffInHours = timeDiffInMilliseconds / (1000 * 60 * 60);

    await employeeActivityModel.findOneAndUpdate(
      { _id: activeCheckIn._id },
      {
        $set: {
          checkOutTime: new Date(),
          timeDiffInHours,
          status: "checked-out",
        },
      },
      { new: true }
    );
  }

  return {
    message: activeCheckIn
      ? 'User checked out and logged out successfully'
      : 'User logged out successfully',
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
    console.log('Token Payload:', resetPasswordTokenDoc);
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

    console.log('Password reset successfully');

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
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.params.id;
    const userRole = req.user; 
    const userType = userRole.userType; 
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

    const updatedUser = await updateUserById(userId, userType, { password: newPassword });

    return updatedUser;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err.message);
  }
};
const fetchCompanyList = async (req) => {
  const { sortBy = 'createdAt', order = 'asc' } = req.query;
  const sortOrder = order === 'desc' ? -1 : 1;

  const companies = await Company.find().sort({ [sortBy]: sortOrder });
  return companies;
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

 const getUserProfile = async(req)=>{
  const {userId} = req.query;
  if(!userId){
    throw new Error("UserId is required");
  }
  const user = await User.findOne({_id:userId});
  if(!user){
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.USER_NOT_FOUND);
  }
  return{
    user
  }
 };

 const updateUser = async (requestBody) => {
  const { userId } = requestBody.query;
  const { body } = requestBody;

  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.USER_NOT_FOUND);
  }

  if (body.email && body.email !== user.email) {
    const emailTaken = await User.isEmailTaken(body.email);
    if (emailTaken) {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.EMAIL_ALREADY_TAKEN);
    }
  }

  if (body.phoneNumber && body.phoneNumber !== user.phoneNumber) {
    const numberTaken = await User.isPhoneNumberTaken(body.phoneNumber);
    if (numberTaken) {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.PHONE_NUMBER_ALREADY_TAKEN);
    }
  }

  Object.keys(body).forEach((key) => {
    if (body[key] === '') {
      delete body[key];
    }
  });

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { ...body },
    { new: true }
  );

  console.log('updatedUser', updatedUser);
  return { updatedUser };
};

const uploaderImage = (req, imageURI) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No user found');
  }

  return { userId, image: imageURI };
};

const uploadImage = async (req, imageURI) => {
  const { userId, image } = uploaderImage(req, imageURI);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { image },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return updatedUser;
};

const uploadMedia = async (req,file, folder) => {
  const user = await User.findOne({
    _id: req.user._id
  });
  console.log("user",user)
  if(!user){
    throw new Error('no user Found')
  }
  const uploadResponse = await uploadFile(file, folder);

  if (!uploadResponse?.success || !uploadResponse?.imageURI) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'File upload failed');
  }

  return {
    userId:req.user._id,
    fileURL: uploadResponse.imageURI,
  };
};
const setPosition = async (req) => {
  const userId = req.user._id;
  const { position } = req.body;

  const updatedPosition = await User.findByIdAndUpdate(
    userId,
    { companyPosition: position },
    { new: true, runValidators: true }
  );

  return updatedPosition;
};
const getPosition = async(req)=>{
  const {userId} = req.query;
  const updatedPosition = await User.findOne({_id:userId}).select('companyPosition');
  return updatedPosition;
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
  fetchCompanyList,
  getUserProfile,
  updateUser,
  uploadImage,
  uploadMedia,
  getUserByPhoneNumber,
  getUsersById,
  setPosition,
  getPosition
};
