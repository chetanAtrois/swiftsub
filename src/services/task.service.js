const Task = require('../models/task.model');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const mapReportData = (req, data, fileData) => {
  const userId = req.user._id;

  if (!fileData || !fileData.uri) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Audio is required');
  }
  const task = {
    userId: userId,
    title: data.body.title,
    description: data.body.description,
    taskDate: data.body.taskDate,
    startWorkingHour: data.body.startWorkingHour,
    endWorkingHour: data.body.endWorkingHour,
    durationOfTask:data.body.durationOfTask,
    status: 'active',
    file: {
      type: fileData.type,
      url: fileData.uri,
    },
  };
  return task;
};

const createTask = async (req, data, fileURI) => {
  const taskData = mapReportData(req, data, fileURI);
  const task = await Task.create(taskData);
  return task;
};

const getTaskByUser = async (req, includeDeleted = false) => {
  const { userId } = req.query;
  const user = await Task.find({ userId: userId })
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No user found');
  }
  const filter = { userId };

  if (!includeDeleted) {
    filter.status = 'active';
  }

  const task = await Task.find(filter).sort({ createdAt: -1 });
  return task;
};

const getTaskByDate = async (req, includeDeleted = false) => {
  const { userId, date } = req.query;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  const filter = { userId };

  if (!includeDeleted) {
    filter.status = 'active';
  }

  if (date) {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    filter.taskDate = { $gte: startOfDay, $lte: endOfDay };
  }

  const task = await Task.find(filter).sort({ createdAt: -1 });

  return task;
};

const deleteTask = async (req) => {
  const { taskId } = req.query;
  const task = await Task.findByIdAndUpdate(
    taskId,
    { status: 'deleted', deletedAt: new Date() },
    { new: true }
  );
  if (task.status === 'deleted') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Task already deleted');
  }

  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
  }
  return task;
};

const getDeletedTaskByUser = async (req, includeDeleted = false) => {
  const { userId } = req.query;
  const user = await Task.find({ userId: userId })
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No user found');
  }
  const filter = { userId };

  if (!includeDeleted) {
    filter.status = 'deleted';
  }
  const task = await Task.find(filter).sort({ createdAt: -1 });
  return task;
};

const getDeletedTaskByDate = async (req, includeDeleted = false) => {
  const { userId, date } = req.query;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  const filter = { userId };

  if (!includeDeleted) {
    filter.status = 'deleted';
  }

  if (date) {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    filter.taskDate = { $gte: startOfDay, $lte: endOfDay };
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1 });

  return tasks;
};

module.exports = {
  createTask,
  getTaskByUser,
  deleteTask,
  getDeletedTaskByUser,
  getTaskByDate,
  getDeletedTaskByDate
};
