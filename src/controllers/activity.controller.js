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
    res.status(httpStatus.OK).send({ success: true, trackDetails });
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

module.exports = {
    userCheckIn,
    userCheckOut,
    trackerStatus,
    updatedLocation,
    getUserLocation,
    getUserLocationHistory,
    turnOffAlarm
};