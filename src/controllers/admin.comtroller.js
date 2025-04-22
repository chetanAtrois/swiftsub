const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { adminService, tokenService } = require('../services');

const registerAdmin = catchAsync(async (req, res) => {
  const adminDetails = await adminService.createAdmin(req.body);
  const tokens = await tokenService.generateAuthTokens(adminDetails, req.body.roleType);
  res.status(httpStatus.CREATED).send({ success: true, adminDetails, tokens });
});

const login = catchAsync(async(req,res)=>{
    const user = await adminService.login(req.body);
    const token = await tokenService.generateAuthTokens(user,req.body.userType);
    if(req.body.userType!=='admin'){
      throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.USER_NOT_FOUND);
    }
    res.status(httpStatus.CREATED).send({success:true,user,token}) 
  });
  const fetchUserList = catchAsync(async (req, res) => {
    const UserList = await adminService.fetchUserList(req);
    res.status(httpStatus.OK).send({ success: true, UserList });
  });
  const addCompany = catchAsync(async (req, res) => {
    const createdCompany = await adminService.addCompany(req.body, req.user._id);
    res.status(httpStatus.OK).send({ success: true, createdCompany });
  });
  const fetchCompanyList = catchAsync(async (req, res) => {
    const UserList = await adminService.fetchCompanyData(req);
    res.status(httpStatus.OK).send({ success: true, UserList });
  });
  
module.exports = {
    registerAdmin,
    login,
    fetchUserList,
    addCompany,
    fetchCompanyList

}