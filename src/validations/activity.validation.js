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
        userId:Joi.string().required(),
    })
};
module.exports = {
    updateLocation,
    checkOut,
    getLocationHistory,
    alarmOff
}