const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  // Temporary folder for storing files

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.get('/verify-otp', validate(authValidation.verifyOtp), authController.verifyOtp);
router.put('/change-password/:id', auth(), validate(authValidation.changePassword), authController.changePassword);
router.post('/logout',auth(),validate(authValidation.logout),authController.logout);
router.get('/companyList',validate(authValidation.fetchCompanyList),authController.CompanyList);
router.get('/getUserProfile',validate(authValidation.getUserProfile),authController.getUserProfile);
router.put('/updateUser',validate(authValidation.updateUser),authController.updateUser);
router.post(
    '/uploadProfileImage',
    auth(), 
    upload.fields([{ name: 'image', maxCount: 1 }]), 
    authController.uploadUserProfileImage 
  );
  router.post(
    '/uploadMedia',
    auth(),  
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
    authController.uploadUserMedia  
  );
  
module.exports = router;
