const express = require('express');
const commonController = require('../../controllers/common.controller');
const auth = require('../../middlewares/auth');


const router = express.Router();
router.post('/sendNotification', commonController.sendPushNotification);
router.get('/getNotification', commonController.getNotification);
router.put('/markNotificationAsRead',commonController.markNotificationAsRead)

module.exports = router;
