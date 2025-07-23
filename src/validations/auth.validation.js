const Joi = require('joi');
const { password ,objectId} = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName:Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    roleType: Joi.string().required().valid('user'),
    dateOfBirth: Joi.string().required(),
    gender:Joi.string().required(),
    fcmToken:Joi.string().optional(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    fcmToken:Joi.string().optional()
  })
};

module.exports = {
  register,
  login
};
