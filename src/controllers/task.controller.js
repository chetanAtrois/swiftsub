const catchAsync = require('../utils/catchAsync');
const taskService = require('../services/task.service');
const { uploadFileS3,uploadFile } = require('../config/upload-image');
const httpStatus = require('http-status');

const createTask = catchAsync(async (req, res) => {
  const files = req.files || {};
  console.log("files data is",files)
  const file = files.file?.[0];
  console.log("files data is here",file);
  let fileData = null;
  if (file) {
    const fileUploadResponse = await uploadFile(file, 'tasks/audio');
    console.log("fileuploadresponse",fileUploadResponse)
    if (fileUploadResponse.success) {
      fileData = {
        uri: fileUploadResponse.imageURI,
        type: file.mimetype,
      };
    } else {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Failed to upload Audio file.' });
    }
  } else {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Audio File is required.' });
  }
  const task = await taskService.createTask(req, req, fileData);

  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Task created successfully.',
    data: task,
  });
});

const getTask = catchAsync(async (req, res) => {
  const tasktList = await taskService.getTaskByUser(req);
  res.status(httpStatus.OK).send({ success: true, tasktList });
});
const getTaskByDate = catchAsync(async (req, res) => {
  const tasktList = await taskService.getTaskByDate(req);
  res.status(httpStatus.OK).send({ success: true, tasktList });
});

const deleteTask = catchAsync(async(req,res)=>{
  const deleteTask = await taskService.deleteTask(req);
  res.status(httpStatus.OK).send({success:true,deleteTask});
});

const getDeletedTask = catchAsync(async (req, res) => {
  const tasktList = await taskService.getDeletedTaskByUser(req);
  res.status(httpStatus.OK).send({ success: true, tasktList });
});
const getDeletedTaskByDate = catchAsync(async (req, res) => {
  const tasktList = await taskService.getDeletedTaskByDate(req);
  res.status(httpStatus.OK).send({ success: true, tasktList });
});


module.exports = {
    createTask,
    getTask,
    deleteTask,
    getDeletedTask,
    getTaskByDate,
    getDeletedTaskByDate
};
