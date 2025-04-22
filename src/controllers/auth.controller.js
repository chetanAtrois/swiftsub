const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { responseMessage, userTypes } = require('../constant/constant');
const ApiError = require('../utils/ApiError');

const register = catchAsync(async(req,res)=>{
  const {roleType} = req.body;
  const user = await authService.register(req.body);
  const token = await tokenService.generateAuthTokens(user,req.body.roleType);
  res.status(httpStatus.CREATED).send({success:true,user,token}) 
});

const login = catchAsync(async (req, res) => {
  const user = await authService.login(req.body);
  const tokens = await tokenService.generateAuthTokens(
    user,
    user.role || 'user' 
  );
  res.status(httpStatus.OK).send({ success: true, user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req);
  res.status(httpStatus.OK).send({success: true});
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
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  const requestObj = {
    message: responseMessage.OTP_SENT_MESSAGE,
  };
  return res.status(httpStatus.OK).send({ success: true, message: requestObj.message, token: resetPasswordToken });
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
  const requestObj = {
    name: updatedPassword.name,
  };
  let userData = updatedPassword;
    userData = {
      ...updatedPassword._doc,
    };
  res.status(httpStatus.OK).send({ success: true, userData });
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
};
