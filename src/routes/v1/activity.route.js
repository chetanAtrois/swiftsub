const express = require('express');
const validate = require('../../middlewares/validate');
const activityValidation = require('../../validations/activity.validation');
const auth = require('../../middlewares/auth');
const activityController = require('../../controllers/activity.controller')

const router = express.Router();

router.post('/userCheckIn',auth(),activityController.userCheckIn);
router.put('/userCheckOut',auth(),validate(activityValidation.checkOut),activityController.userCheckOut);
router.get('/trackStatus',auth(),activityController.trackerStatus);
router.post('/updateUserLocation',validate(activityValidation.updateLocation),activityController.updatedLocation);
router.get('/getUserLocation',activityController.getUserLocation);
router.get('/getLocationHistory',validate(activityValidation.getLocationHistory),activityController.getUserLocationHistory);
router.post('/alarmOff',validate(activityValidation.alarmOff),activityController.turnOffAlarm);
router.post('/autoAlarmOff',validate(activityValidation.autoAlarmOff),activityController.autoTurnOffAlarm);
router.post('/createNote',auth(),validate(activityValidation.createNote),activityController.createNote);
router.get('/getNote',validate(activityValidation.getNote),activityController.getNote);
router.post('/saveContact',auth(),validate(activityValidation.saveContact),activityController.createContact);
router.get('/getContact',validate(activityValidation.getContact),activityController.getContact);

module.exports = router;
