const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { responseMessage, userTypes } = require('../constant/constant');
const ApiError = require('../utils/ApiError');

// Register a new user
const register = catchAsync(async(req,res)=>{
  const {roleType} = req.body;
  const user = await authService.register(req.body); // Create user in DB
  const token = await tokenService.generateAuthTokens(user,req.body.roleType); // Generate JWT
  res.status(httpStatus.CREATED).send({success:true,user,token}) 
});

// User login
const login = catchAsync(async(req,res)=>{
  const user = await authService.login(req.body); // Validate credentials
  const token = await tokenService.generateAuthTokens(user,req.body.userType); // Generate JWT
  
  // Restrict login to 'user' role only (blocks admin/login via this endpoint)
  if(req.body.userType!=='user'){
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.WRONG_CREDENTIAL_MESSAGE);
  }
  res.status(httpStatus.CREATED).send({success:true,user,token}) 
});

// Password reset flow starter
const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body); // Generate OTP token
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken); // Send email
  
  const requestObj = {
    message: responseMessage.OTP_SENT_MESSAGE,
  };
  return res.status(httpStatus.OK).send({ 
    success: true, 
    message: requestObj.message, 
    token: resetPasswordToken // Optional: Return token for dev/testing
  });
});

module.exports = {
  register,
  login,
  forgotPassword
};