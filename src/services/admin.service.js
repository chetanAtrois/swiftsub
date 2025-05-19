const httpStatus = require('http-status');
const Admin = require('../models/admin.model');
const ApiError = require('../utils/ApiError');
const { responseMessage } = require('../constant/constant');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const Token = require('../models/token.model');
const { tokenTypes } = require('../config/tokens');

const createAdmin = async (userBody) => {
  const { email, phoneNumber } = userBody;
  console.log("email,role,phone", userBody);
  if (await Admin.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.EMAIL_ALREADY_TAKEN);
  }
  if (await Admin.isPhoneNumberTaken(phoneNumber)) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.PHONE_NUMBER_ALREADY_TAKEN);
  }
  const createAdmin = await Admin.create({
    role: userBody.roleType,
    ...userBody
  });

  return createAdmin;
};

const login = async (userBody) => {
  const { email, password, userType } = userBody;
  const user = await Admin.findOne({ email: email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.WRONG_CREDENTIAL_MESSAGE);
  }
  const userpassword = await user.isPasswordMatch(password);
  if (!userpassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.WRONG_CREDENTIAL_MESSAGE);
  }
  return user;
};

const logoutAdmin = async (req) => {
  const { refreshToken, email } = req.body;
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.NOT_FOUND);
  }
  await refreshTokenDoc.remove();
};

const fetchUserList = async (req) => {
  const { page, limit,sortBy } = req.query;
  const options = {
    page,
    limit,
    sortBy
  };
  let Data = await User.paginate({}, options)
  return Data;
};

const deleteUser = async (req) => {
  const { userId } = req.query;
  const deletedUser = await User.findOneAndDelete({ _id: userId });
  if(!deletedUser){
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.USER_NOT_FOUND);
  }
  return deletedUser;
};

const updateUser = async (requestBody) => {
  const { userId } = requestBody.query;

  const isUserExists = await User.findOne({ _id: userId });
  if (!isUserExists) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.USER_NOT_FOUND);
  };
  if (requestBody.body.email) {
    const emailTaken = await User.isEmailTaken(requestBody.body.email);
    if (emailTaken) {
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.EMAIL_ALREADY_TAKEN);
    }
  }
  if(requestBody.body.phoneNumber ){
  const numberTaken = await User.isPhoneNumberTaken(requestBody.body.phoneNumber);
  if (numberTaken) {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.PHONE_NUMBER_ALREADY_TAKEN);
  }
}
  const updateData = {
    ...requestBody.body,
  };

  // const userUpdateValue = compareUpdatedValue(isUserExists, { _id: isUserExists._id, ...updateData });
  const updatedUser = await User.findOneAndUpdate({
    _id: userId
  },
    updateData,
    {
      new: true
    });
  console.log('updatedUser', updatedUser);
  return {  updatedUser };
};

const addCompany = async (companyData, userId) => {
  const createCompany = await Company.create({
    ...companyData,
    createdBy: userId,
  });
  return createCompany;
};
const updateCompany = async (requestBody) => {
  const { companyId } = requestBody.query;

  const isCompanyExists = await Company.findOne({ _id: companyId });
  if (!isCompanyExists) {
    throw new ApiError(httpStatus.NOT_FOUND, responseMessage.COMPANY_NOT_FOUND);
  };
  const updateData = {
    ...requestBody.body,
  };

  // const userUpdateValue = compareUpdatedValue(isUserExists, { _id: isUserExists._id, ...updateData });
  const updatedCompany = await Company.findOneAndUpdate({
    _id: companyId
  },
    updateData,
    {
      new: true
    });
  console.log('updatedUser', updatedCompany);
  return {  updatedCompany };
};

const fetchCompanyData = async (req) => {
  const { page, limit,sortBy } = req.query;
  const options = {
    page,
    limit,
    sortBy
  };
  let Data = await Company.paginate({}, options)
  return Data;
};
const deleteCompany = async(req)=>{
  const{companyId} = req.query;
  const companyData = await Company.findOneAndDelete({_id:companyId});
  if(!companyData){
    throw new ApiError(httpStatus.BAD_REQUEST,responseMessage.COMPANY_NOT_FOUND);
  }
  return companyData;
};
const getAdminByEmail = async (email) => {
  return Admin.findOne({ email });
};
const getAdminById = async (id) => {
  return Admin.findById(id);
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

module.exports = {
  createAdmin,
  login,
  fetchUserList,
  addCompany,
  fetchCompanyData,
  getAdminByEmail,
  getAdminById,
  updateAdminById,
  deleteUser,
  updateUser,
  deleteCompany,
  updateCompany,
  logoutAdmin
}