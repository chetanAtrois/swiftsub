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
    status:data.body.status ,
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

const updateTask = async (req, fileData) => {
  const { taskId } = req.query;
  const userId = req.user._id;
  const {
    title,
    description,
    taskDate,
    startWorkingHour,
    endWorkingHour,
    durationOfTask,
    file,
    status
  } = req.body;

  console.log(" [UpdateTask] Incoming request:");
  console.log(" taskId:", taskId);
  console.log(" userId:", userId);
  console.log(" fileData:", fileData);
  console.log(" body:", {
    title,
    description,
    taskDate,
    startWorkingHour,
    endWorkingHour,
    durationOfTask,
    file,
    status
  });

  if (!taskId) throw new ApiError(400, 'taskId is required');

  const task = await Task.findById(taskId);
  console.log(" [UpdateTask] Existing Task:", task);

  if (!task) throw new ApiError(404, 'Task not found');

  if (task.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this task');
  }

  const updates = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (taskDate) updates.taskDate = taskDate;
  if (startWorkingHour) updates.startWorkingHour = startWorkingHour;
  if (endWorkingHour) updates.endWorkingHour = endWorkingHour;
  if (durationOfTask) updates.durationOfTask = durationOfTask;
  if (status) updates.status = status;

  if (fileData) {
    updates.file = {
      url: fileData.url,
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
    };
  }

  console.log(" [UpdateTask] Updates to apply:", updates);

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedTask) {
    console.error(" [UpdateTask] Failed to update task in DB");
    throw new ApiError(500, 'Failed to update task');
  }

  console.log("✅ [UpdateTask] Task updated successfully:", updatedTask);

  return updatedTask;
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
  getDeletedTaskByDate,
  updateTask
};
