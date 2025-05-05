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
module.exports = {
    updateLocation,
    checkOut
}