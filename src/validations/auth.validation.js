const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.when('method', {
      is: Joi.exist(), 
      then: Joi.when('method', {
        is: 'google',
        then: Joi.string().optional(),
        otherwise: Joi.string().required()
      }),
      otherwise: Joi.string().required() 
    }),
    roleType: Joi.string().required().valid('user','admin'),
    phoneNumber: Joi.string().required(),
    companyName: Joi.string().required(),
    method: Joi.string().valid('google').optional() 
  }),
};



const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.when('method', {
      is: 'google',
      then: Joi.string().optional(),
      otherwise: Joi.string().required()
    }),
    method: Joi.string().valid('google').optional()
  })
};

const loginViaPhoneNumber = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required(),
    userType: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
    email: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().required()
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    confirmNewPassword:Joi.string().required()
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const verifyOtp = {
  query: Joi.object().keys({
    otp: Joi.string().required(),
    email: Joi.string().required(),
  }),
};

const createItem = {
  body: Joi.object().keys({
    itemName: Joi.string().required(),
    volume: Joi.string().required(),
    weight: Joi.string().required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    currentPassword:Joi.string().required(),
    newPassword:Joi.string().required(),
    confirmPassword:Joi.string().required()
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  createItem,
  changePassword,
  verifyOtp,
  loginViaPhoneNumber,
};
