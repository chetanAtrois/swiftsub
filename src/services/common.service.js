const sendNotifications = require('../config/notification');
const Notification = require('../models/notification.model'); 
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const User = require('../models/user.model');

const pushNotification = async (req) => {
  const {
    senderId,
    receiverId,
    senderUserType,
    receiverUserType,
    title,
    message,
    notificationType,
  } = req.body;

  if (!receiverId || !receiverUserType) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Receiver ID and user type are required');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver || typeof receiver.fcmToken !== 'string' || !receiver.fcmToken.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'FCM token not found for the receiver');
  }

  const fcmMessage = {
    notification: {
      title,
      body: message,
    },
    data: {
      senderId,
      receiverId,
      title,
      body: message,
      notificationType,
    },
    token: receiver.fcmToken,
  };

  const notificationResult = await sendNotifications(fcmMessage);

  // Save single notification document
  await Notification.create({
    userId: receiverId,
    userType: receiverUserType,
    title,
    message,
    notificationType,
    notificationSender: senderId,
    senderUserType,
    notificationCreatedAt: new Date(),
    read: false, // explicitly default
  });

  return {
    message: 'Notification sent and saved in DB',
    result: notificationResult,
  };
};


const getNotification = async (req) => {
  const { userId } = req.query;

  if (!userId) {
    throw new Error("User ID is required");
  }

  const userNotifications = await Notification.find({ userId }).sort({ createdAt: -1 });

  if (!userNotifications) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No Notification found for this user');
  }

  return userNotifications;
};
const markNotificationAsRead = async (req) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  const result = await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true } }
  );

  if (result.modifiedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No unread notifications found for this user');
  }

  return {
    message: 'All unread notifications marked as read',
    updatedCount: result.modifiedCount,
  };
};


module.exports = {
  pushNotification,
  getNotification,
  markNotificationAsRead
};
