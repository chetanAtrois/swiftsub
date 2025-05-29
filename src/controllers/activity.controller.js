const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const activityService = require('../services/activity.service');

const userCheckIn = catchAsync(async (req, res) => {
    const checkinDetails = await activityService.userCheckIn(req);
    res.status(httpStatus.OK).send({ success: true, checkinDetails });
});

const userCheckOut = catchAsync(async (req, res) => {
    const checkOutDetails = await activityService.userCheckOut(req);
    res.status(httpStatus.OK).send({ success: true, checkOutDetails });
});

const trackerStatus = catchAsync(async (req, res) => {
  const trackDetails = await activityService.trackerStatus(req);

  const { message, ...rest } = trackDetails;

  res.status(httpStatus.OK).send({
    success: true,
    message,
    trackDetails: rest
  });
});

const updatedLocation = catchAsync(async (req, res) => {
    const updatedLocationData = await activityService.updateLocation(req);
    res.status(httpStatus.OK).send({ success: true, updatedLocationData });
});
const getUserLocationHistory = catchAsync(async (req, res) => {
    const locationHistoryData = await activityService.getLocationHistory(req);
    res.status(httpStatus.OK).send({ success: true, locationHistoryData });
});

const getUserLocation = catchAsync(async (req, res) => {
    const locationHistoryData = await activityService.getUserLocation(req);
    res.status(httpStatus.OK).send({ success: true, locationHistoryData });
});
const turnOffAlarm = catchAsync(async (req, res) => {
    const alarmoff = await activityService.turnOffAlarm(req);
    res.status(httpStatus.OK).send({ success: true, alarmoff });
});

const autoTurnOffAlarm = catchAsync(async (req, res) => {
    const alarmoff = await activityService.autoTurnOffAlarm(req);
    res.status(httpStatus.OK).send({ success: true, alarmoff });
});
const createNote = catchAsync(async(req,res)=>{
    const noteList = await activityService.createNotes(req);
    res.status(httpStatus.OK).send({success:true,noteList});
});
const getNote = catchAsync(async(req,res)=>{
    const noteList = await activityService.getNotes(req);
    res.status(httpStatus.OK).send({success:true,noteList});
});
const createContact = catchAsync(async(req,res)=>{
    const contactData = await activityService.saveContact(req);
    res.status(httpStatus.OK).send({success:true,contactData});
});
const getContact = catchAsync(async(req,res)=>{
    const contactData = await activityService.getContact(req);
    res.status(httpStatus.OK).send({success:true,contactData});
});

module.exports = {
    userCheckIn,
    userCheckOut,
    trackerStatus,
    updatedLocation,
    getUserLocation,
    getUserLocationHistory,
    turnOffAlarm,
    autoTurnOffAlarm,
    createNote,
    getNote,
    createContact,
    getContact
};