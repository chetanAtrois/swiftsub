const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { adminService, tokenService } = require('../services');

const registerAdmin = catchAsync(async (req, res) => {
  const adminDetails = await adminService.createAdmin(req.body);
  const tokens = await tokenService.generateAuthTokens(adminDetails, req.body.roleType);
  res.status(httpStatus.CREATED).send({ success: true, adminDetails, tokens });
});

const login = catchAsync(async (req, res) => {
  const user = await adminService.login(req.body);
  const token = await tokenService.generateAuthTokens(user, req.body.userType);
  if (req.body.userType !== 'admin') {
    throw new ApiError(httpStatus.BAD_REQUEST, responseMessage.USER_NOT_FOUND);
  }
  res.status(httpStatus.CREATED).send({ success: true, user, token })
});

const logoutAdmin = catchAsync(async (req, res) => {
  await adminService.logoutAdmin(req);
  res.status(httpStatus.OK).send({success: true});
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

const updateCompany = catchAsync(async (req, res) => {
  const UpdatedCompanyData = await adminService.updateCompany(req);
  res.status(httpStatus.OK).send({ success: true, UpdatedCompanyData });
});

const deleteCompany = catchAsync(async(req,res)=>{
  const deletedCompany = await adminService.deleteCompany(req);
  res.status(httpStatus.OK).send({success:true,deletedCompany})
});

const deleteUser = catchAsync(async (req, res) => {
  const deletedUserList = await adminService.deleteUser(req);
  res.status(httpStatus.OK).send({ success: true, deletedUserList })
});

const updateUser = catchAsync(async(req,res)=>{
  const updatedUSer = await adminService.updateUser(req);
  res.status(httpStatus.OK).send({ success: true, updatedUSer })
})

module.exports = {
  registerAdmin,
  login,
  fetchUserList,
  addCompany,
  fetchCompanyList,
  deleteUser,
  updateUser,
  deleteCompany,
  updateCompany,
  logoutAdmin
};