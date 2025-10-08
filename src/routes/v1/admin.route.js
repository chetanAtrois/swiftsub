const express = require('express');
const adminController = require('../../controllers/profile.controller');

const router = express.Router();

router.get('/users', adminController.getUsersList);


router.get('/users/profile', adminController.getUserProfileByQuery);


router.put('/users', adminController.updateUserByQuery);


router.delete('/users', adminController.deleteUserByQuery);


router.get('/profile', adminController.getProfileByQuery);
router.put('/profile', adminController.updateProfileByQuery);

module.exports = router;
