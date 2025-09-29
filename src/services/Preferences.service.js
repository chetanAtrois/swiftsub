const httpStatus = require('http-status');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { responseMessage } = require('../constant/constant');

const setPreferences = async (userId, preferencesBody) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.USER_NOT_FOUND);
  }

 
  user.preferences = {
    ...user.preferences.toObject(),
    ...preferencesBody
  };

  await user.save();
  return user.preferences;
};

module.exports = { setPreferences };
