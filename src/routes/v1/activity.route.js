const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const activityController = require('../../controllers/activity.controller')

const router = express.Router();

router.post('/userCheckIn',auth(),activityController.userCheckIn);
router.put('/userCheckOut',auth(),activityController.userCheckOut);
router.get('/trackStatus',auth(),activityController.trackerStatus);



module.exports = router;
