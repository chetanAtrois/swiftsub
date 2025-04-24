const express = require('express');
const validate = require('../../middlewares/validate');
const adminValidation = require('../../validations/admin.validation');
const adminController = require('../../controllers/admin.comtroller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/registerAdmin', validate(adminValidation.register), adminController.registerAdmin);
router.post('/loginAdmin', validate(adminValidation.login), adminController.login);
router.post('/logoutAdmin', validate(adminValidation.logoutAdmin), adminController.logoutAdmin);
router.get('/fetchUserList', auth('fetchUserList'),validate(adminValidation.fetchUserData), adminController.fetchUserList);
router.post('/addCompany', auth('addCompany'),validate(adminValidation.addCompany), adminController.addCompany);
router.get('/fetchCompanyList', auth('fetchCompanyList'),validate(adminValidation.fetchCompanyData), adminController.fetchCompanyList);
router.delete('/deleteUser', auth('deleteUser'),validate(adminValidation.deleteUser), adminController.deleteUser);
router.put('/updateUser', auth('updateUser'),validate(adminValidation.updateUser), adminController.updateUser);
router.delete('/deleteCompany', auth('deleteCompany'),validate(adminValidation.deleteCompany), adminController.deleteCompany);
router.put('/updateCompany', auth('updateCompany'),validate(adminValidation.updateCompany), adminController.updateCompany);

module.exports = router;