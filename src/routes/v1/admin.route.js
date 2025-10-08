const express = require('express');
const adminController = require('../../controllers/profile.controller');

const router = express.Router();

router.get('/getUserList', adminController.getUsersList);
router.get('/getUserProfile', adminController.getUserProfileByQuery);
router.put('/updateUserProfile', adminController.updateUserByQuery);
router.delete('/deleteProfile', adminController.deleteUserByQuery);
router.get('/adminProfile', adminController.getProfileByQuery);
router.get('/searchUser',adminController.searchUser);


module.exports = router;
