const express = require('express');
const commonController = require('../../controllers/common.controller');

const router = express.Router();
router.post('/sendNotification', commonController.sendPushNotification);
router.get('/getNotification', commonController.getNotification);

module.exports = router;
