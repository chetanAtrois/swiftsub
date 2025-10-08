const httpStatus = require('http-status');
const  User  = require('../models/admin.model');
const ApiError = require('../utils/ApiError');
const { responseMessage } = require('../constant/constant');
const Admin = require("../models/admin.model");

 
const searchUsers = async (query) => {
  const searchQuery = {};

  if (query) {
    searchQuery.$or = [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ];
  }

  const users = await User.findOne(searchQuery).select('-password');
  console.log("sfsdf:",users);
  return users;
};


const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

const getUserById = async (id) => {
  return User.findById(id);
};

const getAdminById = async (id) => {
  return Admin.findById(id);
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.USER_NOT_FOUND);
  }
  if (user.email && (await User.isEmailTaken(user.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.EMAIL_ALREADY_TAKEN);
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const updateAdminById = async (userId, updateBody) => {
  const user = await getAdminById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.USER_NOT_FOUND);
  }
  if (user.email && (await Admin.isEmailTaken(user.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.EMAIL_ALREADY_TAKEN);
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.USER_NOT_FOUND);
  }
  await user.remove();
  return user;
};

const getUserByPhoneNumber = async (phoneNumber) => {
  return User.findOne(phoneNumber);
};



module.exports = {
  queryUsers,
  getUserById,
  getUserByEmail,
  deleteUserById,
  getUserByPhoneNumber,
  updateUserById,
  searchUsers,
  getAdminById,
  updateAdminById
};
