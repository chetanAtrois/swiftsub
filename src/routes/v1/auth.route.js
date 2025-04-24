const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.get('/verify-otp', validate(authValidation.verifyOtp), authController.verifyOtp);
router.put('/change-password/:id', auth(), validate(authValidation.changePassword), authController.changePassword);
router.post('/logout',validate(authValidation.logout),authController.logout);

module.exports = router;
