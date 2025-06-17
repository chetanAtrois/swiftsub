const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  
const reportController = require('../../controllers/report.controller');  
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/createReport', 
    auth(), 
    upload.fields([
      { name: 'images', maxCount: 5 },   
      { name: 'file', maxCount: 1 }      
    ]), 
    reportController.createReport
);
router.get('/getReport', reportController.getReports);
router.delete('/deleteReport', reportController.deleteReport);
router.put('/updateReport',auth(),upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]),
reportController.updateReport);
module.exports = router;
