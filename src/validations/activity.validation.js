const Joi = require('joi');
const updateLocation = {
    body: Joi.object().keys({
        userId: Joi.string().required(),
        latitude: Joi.string().required(),
        longitude: Joi.string().required()
    })
};
const checkOut = {
    query:Joi.object().keys({
        employeeActivityId:Joi.string().required()
    })
};
const getUserLocation={
    query:Joi.object().keys({
        userId:Joi.string().required()
    })
};

const getLocationHistory={
    query:Joi.object().keys({
        userId:Joi.string().required()
    })
};
const alarmOff={
    body:Joi.object().keys({
        activityId:Joi.string().required(),
    })
};
const autoAlarmOff={
    body:Joi.object().keys({
        activityId:Joi.string().required(),
    })
};
const createNote = {
    body:Joi.object().keys({
        title:Joi.string().required(),
        description:Joi.string().required()
    })
};
const saveContact = {
    body:Joi.object().keys({
        contactNumber:Joi.string().required(),
        contactName:Joi.string().required(),
        contactNote:Joi.string().optional(),
        contactEmail: Joi.string().email().allow(''),
    })
};
const getNote = {
    query:Joi.object().keys({
        userId:Joi.string().required(),
    })
};

const getContact = {
    query:Joi.object().keys({
        userId:Joi.string().required(),
    })
};
const getLocationByDate = {
    query:Joi.object().keys({
        userId:Joi.string().required(),
        date:Joi.string().required()
    })
};
module.exports = {
    updateLocation,
    checkOut,
    getLocationHistory,
    alarmOff,
    autoAlarmOff,
    createNote,
    getNote,
    saveContact,
    getContact,
    getLocationByDate
};