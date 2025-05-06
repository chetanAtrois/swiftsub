const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  // Temporary folder for storing files
const reportController = require('../../controllers/report.controller');  // Adjust the path accordingly
const auth = require('../../middlewares/auth');

const router = express.Router();

// Route to handle creating a report and uploading images
router.post('/createReport', auth(),upload.array('images', 5), reportController.createReport);
router.get('/getReport', reportController.getReports);
router.delete('/deleteReport', reportController.deleteReport);
module.exports = router;
