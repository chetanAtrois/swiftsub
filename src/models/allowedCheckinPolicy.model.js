const mongoose = require('mongoose');

const allowedCheckinPolicySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, 
    required: true
  },
  allowedCheckInTime: {
    type: String, 
    required: true
  }
}, {
  timestamps: true
});

allowedCheckinPolicySchema.index({ userId: 1, date: 1 }, { unique: true }); 

module.exports = mongoose.model('AllowedCheckinPolicy', allowedCheckinPolicySchema);
