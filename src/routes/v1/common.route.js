const express = require('express');
const commonController = require('../../controllers/common.controller');
const auth = require('../../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  

const router = express.Router();
router.post('/sendNotification', commonController.sendPushNotification);
router.get('/getNotification', commonController.getNotification);
router.put('/markNotificationAsRead',commonController.markNotificationAsRead);
router.post('/speechToText', 
    auth(), 
    upload.fields([
      { name: 'file', maxCount: 1 }      
    ]), 
    commonController.speechToText
);
router.post('/textToSpeech', auth(), commonController.textToSpeech);

module.exports = router;
