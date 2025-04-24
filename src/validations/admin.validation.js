const Joi = require('joi');
const { password ,objectId} = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required().custom(password),
    roleType: Joi.string().required().valid('admin'),
    phoneNumber:Joi.string().required(),

  }),
};
const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password:Joi.string().required(),
    userType:Joi.string().required()
  }),
};

const logoutAdmin = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
    email: Joi.string().required(),
  }),
};

const fetchUserData = {
  query: Joi.object().keys({
    page: Joi.string().required(),
    limit: Joi.string().required(),
    userType: Joi.string().required()
  }),
};
const addCompany = {
  body: Joi.object().keys({
    name:Joi.string().required(),
    description:Joi.string().required(),
    industry:Joi.string().required(),
    totalEmployees:Joi.string().required(),
    address:Joi.string().required(),

  }),
};
const fetchCompanyData = {
  query: Joi.object().keys({
    page: Joi.string().required(),
    limit: Joi.string().required(),
  }),
};
const deleteUser = {
  query:Joi.object().keys({
    userId:Joi.string().custom(objectId)
  })
};
const deleteCompany = {
  query:Joi.object().keys({
    companyId:Joi.string().custom(objectId)
  })
};
const updateUser = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      fullName: Joi.string().required(),
      companyName:Joi.string().required(),
      phoneNumber:Joi.string().required()
    })
};
const updateCompany = {
  query: Joi.object().keys({
    companyId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      description: Joi.string().required(),
      industry:Joi.string().required(),
      totalEmployees:Joi.string().required(),
      address:Joi.string().required()
    })
};
module.exports = {
    register,
    login,
    fetchUserData,
    addCompany,
    fetchCompanyData,
    deleteUser,
    updateUser,
    deleteCompany,
    updateCompany,
    logoutAdmin
}