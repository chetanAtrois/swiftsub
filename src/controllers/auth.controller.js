const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { responseMessage, userTypes } = require('../constant/constant');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const { uploadFile } = require('../config/upload-image');


const register = catchAsync(async(req,res)=>{
  const {roleType} = req.body;
  const user = await authService.register(req.body);
  const token = await tokenService.generateAuthTokens(user,req.body.roleType);
  res.status(httpStatus.CREATED).send({success:true,user,token}) 
});

const login = catchAsync(async (req, res) => {
  const user = await authService.login(req.body);
  console.log('User returned from login:', user);

  const tokens = await tokenService.generateAuthTokens(
    user,
    user.role || 'user' 
  );
  console.log('User returned from login:', user);

  res.status(httpStatus.OK).send({ success: true, user, tokens });
});

const logout = catchAsync(async (req, res) => {
  const { message } = await authService.logout(req);
  res.status(httpStatus.OK).send({success: true,message});
});

const loginViaPhoneNumber = catchAsync(async (req, res) => {
  const user = await authService.loginUserWithPhoneNumber(req.body);
  const tokens = await tokenService.generateAuthTokens(user, req.body.userType);
  res.status(httpStatus.OK).send({ success: true, user, tokens });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  let user = await User.findOne({ email }).select('fullName email _id method');
  if (!user) {
    user = await Admin.findOne({ email }).select('fullName email _id method');;
  }
  if (user.method === 'google') {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: 'Password reset is not available for Google sign-in accounts.',
    });
  }
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body);
  await emailService.sendResetPasswordEmail(email, resetPasswordToken);
  return res.status(httpStatus.OK).send({
    success: true,
    message: responseMessage.OTP_SENT_MESSAGE,
    token: resetPasswordToken });
});

const verifyOtp = catchAsync(async (req, res) => {
  const { otp, email } = req.query;
  const otpVerify = await emailService.verifyOtp(otp, email);
  res.send({ success: true, otpVerify ,message:"otp verified Successfully"});
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body);
  const requestObj = {
    message: responseMessage.RESET_PASSWORD_MESSAGE,
  };
  let data = requestObj;
  res.send({ success: true, message: data.message });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const changePassword = catchAsync(async (req, res) => {
  const updatedPassword = await authService.changePassword(req);
  const userData = {
    ...updatedPassword._doc,
  };
  res.status(httpStatus.OK).send({ success: true, userData });
});
const CompanyList = catchAsync(async (req, res) => {
  const companyList = await authService.fetchCompanyList(req);
  res.status(httpStatus.OK).send({ success: true, companyList });
});
const getUserProfile = catchAsync(async(req,res)=>{
  const userList = await authService.getUserProfile(req);
  res.status(httpStatus.OK).send({success:true,userList});
});

const updateUser = catchAsync(async(req,res)=>{
  const updatedList = await authService.updateUser(req);
  res.status(httpStatus.OK).send({success:true,updatedList});
});

const uploadUserProfileImage = catchAsync(async (req, res) => {
  const files = req.files || {};
  const imageFile = files.image?.[0];

  if (!imageFile) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Image file is required.' });
  }

  const uploadResponse = await uploadFile(imageFile, 'users/profile-images');

  if (!uploadResponse?.success || !uploadResponse?.imageURI) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Image upload failed.' });
  }

  const updatedUser = await authService.uploadImage(req, uploadResponse.imageURI);

  res.status(httpStatus.OK).send({
    success: true,
    message: 'Profile image uploaded successfully.',
    data: {
      userId: updatedUser._id,
      image: updatedUser.image
    },
  });
});
const uploadUserMedia = catchAsync(async (req, res) => {
  const files = req.files || {};
  const imageFile = files.image?.[0];
  const audioFile = files.audio?.[0];

  if ((imageFile && audioFile) || (!imageFile && !audioFile)) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Send only one file: image or audio.' });
  }

  const file = imageFile || audioFile;
  const folder = imageFile ? 'chat/images' : 'chat/audios';
  const fileType = imageFile ? 'image' : 'audio';

  const uploadResult = await authService.uploadMedia(req,file, folder);

  res.status(httpStatus.OK).send({
    success: true,
    message: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully.`,
    data: {
      fileURL: uploadResult.fileURL,
      fileType,
      UserId:uploadResult.userId
    },
  });
});



module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  verifyOtp,
  changePassword,
  loginViaPhoneNumber,
  CompanyList,
  getUserProfile,
  updateUser,
  uploadUserProfileImage,
  uploadUserMedia
};
