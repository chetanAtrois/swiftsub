const mongoose = require('mongoose');

const employeeActvitySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date,
    required: false
  },
  checkInTimeDifference: {
    type: Number,
    required: false
  },
  checkInStatus: {
    type: String,
    required: false,
  },
  alarmLogs: [
    {
      time: {
        type: Date,
        required: true
      },
      turnedOffBy: {
        type: String,
        enum: ['user', 'system'],
        required: true
      }
    }
  ],
    status: {
    type: String,
    enum: ["checked-in", "checked-out"],
    default: "checked-in"
  }
}, {
  timestamps: true
});

const employeeActivityModel = mongoose.model('employeeActivity', employeeActvitySchema);

module.exports = employeeActivityModel;