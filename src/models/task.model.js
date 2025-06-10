const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title:{
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  taskDate: {
    type: Date,
    required: true,
  },
  startWorkingHour: {
    type: String,
    required: true,
  },
  endWorkingHour: {
    type: String,
    required: true,
  },

  file: {
    type: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'deleted','completed'],
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
