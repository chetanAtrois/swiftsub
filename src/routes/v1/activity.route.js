const express = require('express');
const validate = require('../../middlewares/validate');
const activityValidation = require('../../validations/activity.validation');
const auth = require('../../middlewares/auth');
const activityController = require('../../controllers/activity.controller')

const router = express.Router();

router.post('/userCheckIn',auth(),activityController.userCheckIn);
router.put('/userCheckOut',auth(),activityController.userCheckOut);
router.get('/trackStatus',auth(),validate(activityValidation.checkOut),activityController.trackerStatus);
router.post('/updateUserLocation',validate(activityValidation.updateLocation),activityController.updatedLocation);

module.exports = router;
