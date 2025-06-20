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
    enum: ['on-time', 'early', 'late'],
    required: false
  },
  adminCheckInTime: {
    type: Date,
    required: false
  },
  adminCheckOutTime: {
    type: Date,
    required: false
  },
  adminWorkingDate: {
    type: Date,
    required: false
  },
  timeDiffInHours: {
    type: Number,
    required: false
  },
  lateCheckInMinutes: {
    type: Number,
    required: false
  },
  earlyCheckOutMinutes: {
    type: Number,
    required: false
  },
  overworkHours: {
    type: Number,
    required: false
  },
  underworkHours: {
    type: Number,
    required: false
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
