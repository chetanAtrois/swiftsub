const express = require('express');
const adminController = require('../../controllers/profile.controller');
const auth = require('../../middlewares/auth');
const upload = require('../../config/multer')


const router = express.Router();

router.get('/getUserList', auth ('getUserList'), adminController.fetchUserList);
router.get('/getUserProfile', auth('getUserProfile'), adminController.getUserProfileByQuery);
router.put('/updateUserProfile', auth('updateUserProfile') ,adminController.updateUserByQuery);
router.delete('/deleteProfile', auth ('deleteProfile') ,adminController.deleteUserByQuery);
router.get('/adminProfile', auth ('adminProfile') ,adminController.getProfileByQuery);
router.get('/searchUser', auth ('searchUser'), adminController.searchUser);
router.post('/uploadProfilePic',upload.single('file'),adminController.UploadProfilePicture);


module.exports = router;
