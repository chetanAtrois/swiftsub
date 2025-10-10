const express = require('express');
const adminController = require('../../controllers/profile.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/getUserList', auth ('getUserList'), adminController.getUsersList);
router.get('/getUserProfile', auth('getUserProfile'), adminController.getUserProfileByQuery);
router.put('/updateUserProfile', auth('updateUserProfile') ,adminController.updateUserByQuery);
router.delete('/deleteProfile', auth ('deleteProfile') ,adminController.deleteUserByQuery);
router.get('/adminProfile', auth ('adminProfile') ,adminController.getProfileByQuery);
router.get('/searchUser', auth ('searchUser'), adminController.searchUser);


module.exports = router;
