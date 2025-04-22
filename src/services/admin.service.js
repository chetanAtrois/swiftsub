const httpStatus = require('http-status');
const Admin = require('../models/admin.model');
const ApiError = require('../utils/ApiError');
const { responseMessage } = require('../constant/constant');
const User = require('../models/user.model');
const Company = require('../models/company.model');

const createAdmin = async (userBody) => {
    const { email, phoneNumber } = userBody;
    console.log("email,role,phone", userBody)
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
    const { email, password,userType } = userBody;
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

  const fetchUserList = async (req) => {
    const { page, limit,userType } = req.query;
    const options = {
      page,
      limit,
    };
    let Data = await User.paginate({}, options)
    return Data;
  };

  const addCompany = async (companyData, userId) => {
    const createCompany = await Company.create({
      ...companyData,
      createdBy: userId,
    });
    return createCompany;
  };

  const fetchCompanyData = async (req) => {
    const { page, limit } = req.query;
    const options = {
      page,
      limit,
    };
    let Data = await Company.paginate({}, options)
    return Data;
  };

  

  module.exports={
    createAdmin,
    login,
    fetchUserList,
    addCompany,
    fetchCompanyData
  }