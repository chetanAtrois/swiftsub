const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  
const taskController = require('../../controllers/task.controller');  
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/createTask', 
    auth(), 
    upload.fields([
      { name: 'file', maxCount: 1 }      
    ]), 
    taskController.createTask
);
router.get('/getTask', taskController.getTask);
router.put('/deleteTask', taskController.deleteTask);
router.get('/getDeletedTask',taskController.getDeletedTask);
module.exports = router;
