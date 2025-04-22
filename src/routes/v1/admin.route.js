const express = require('express');
const validate = require('../../middlewares/validate');
const adminValidation = require('../../validations/admin.validation');
const adminController = require('../../controllers/admin.comtroller');
const auth = require('../../middlewares/auth');


const router = express.Router();

router.post('/registerAdmin', validate(adminValidation.register), adminController.registerAdmin);
router.post('/loginAdmin', validate(adminValidation.login), adminController.login);
router.get('/fetchUserList', validate(adminValidation.fetchUserData), adminController.fetchUserList);
router.post('/addCompany', validate(adminValidation.addCompany), adminController.addCompany);
router.get('/fetchCompanyList', auth('fetchCompanyList'), validate(adminValidation.fetchCompanyData), adminController.fetchCompanyList);



module.exports = router;