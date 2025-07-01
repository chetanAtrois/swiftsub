const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title:{
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  text:{
    type: String,
    required: false,
  },
  taskDate: {
    type: Date,
    required: false,
  },
  startWorkingHour: {
    type: String,
    required: false,
  },
  endWorkingHour: {
    type: String,
    required: false,
  },
  durationOfTask:{
    type: String,
    required: false,
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
    enum: ['seen', 'accepted', 'progress', 'completed'],
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
