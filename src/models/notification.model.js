const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Types.ObjectId, 
      required: true,
      refPath: 'userType' 
    },
    userType: { 
      type: String, 
      required: true, 
      enum: ['User', 'subAdmin'] 
    },
    title: { type: String, default: null },
    message: { type: String, default: null },
    notificationType: { type: String, default: null },

    notificationSender: {
      type: mongoose.Types.ObjectId,
      refPath: 'senderUserType'
    },
    senderUserType: { 
      type: String, 
      enum: ['User', 'subAdmin'], 
      required: true 
    },

    notificationCreatedAt: {
      type: Date, 
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
