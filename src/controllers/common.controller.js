const commonService = require('../services/common.service');
const catchAsync = require('../utils/catchAsync');

const sendPushNotification = catchAsync(async (req, res) => {
    console.log('sendPushNotification called');
    const sendNotification = await commonService.pushNotification(req);
    res.status(200).send({ success: true, sendNotification });
  });
  const getNotification = catchAsync(async (req, res) => {
    const notificationData = await commonService.getNotification(req);
    res.status(200).send({ success: true, notificationData });
  });
  const deleteNotification = catchAsync(async (req, res) => {
    const deletedNotification = await commonService.deleteNotification(req);
    res.status(200).send({ success: true, deletedNotification });
  });
  const markNotificationAsRead = catchAsync(async (req, res) => {
    const notificationData = await commonService.markNotificationAsRead(req);
    res.status(200).send({ success: true, notificationData });
  });
  const speechToText = catchAsync(async (req, res) => {
    const convertedData = await commonService.speechToText(req);
    res.status(200).send({ success: true, convertedData });
  });
  const textToSpeech = catchAsync(async (req, res) => {
    const convertedData = await commonService.textToSpeech(req);
    res.status(200).send({ success: true, convertedData });
  });

  module.exports = {
    sendPushNotification,
    getNotification,
    markNotificationAsRead,
    speechToText,
    textToSpeech,
    deleteNotification
  }