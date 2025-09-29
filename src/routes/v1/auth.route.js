const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/register-admin', validate(authValidation.register), authController.register);
// router.put('/registerSecondStep',authController.registerSecondStep);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/sendVerificationEmail',authController.sendVerificationEmail);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.get('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.put('/change-password/:id', auth(), validate(authValidation.changePassword), authController.changePassword);
router.post('/logout',authController.logout);

module.exports = router;
