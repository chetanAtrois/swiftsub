const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  
const taskController = require('../../controllers/task.controller');  
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const taskValidation = require('../../validations/task.validation');


const router = express.Router();

router.post('/createTask', 
    auth(), 
    upload.fields([
      { name: 'file', maxCount: 1 }      
    ]), 
    taskController.createTask
);
router.get('/getTask', validate(taskValidation.getTaskByUser),taskController.getTask);
router.get('/getTaskByDate', validate(taskValidation.getTaskByDate),taskController.getTaskByDate);
router.put('/deleteTask', validate(taskValidation.deleteTask),taskController.deleteTask);
router.get('/getDeletedTask',validate(taskValidation.getDeletedTaskByUser),taskController.getDeletedTask);
router.get('/getDeletedTaskByDate',validate(taskValidation.getDeletedTaskByDate),taskController.getDeletedTaskByDate);
router.put(
  '/updateTask',
  auth(),
  upload.fields([{ name: 'file', maxCount: 1 }]), validate(taskValidation.updateTask),
  taskController.updateTask
);
module.exports = router;
