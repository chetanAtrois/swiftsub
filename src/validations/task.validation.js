const Joi = require('joi');
const getTaskByUser = {
    query:Joi.object().keys({
        userId:Joi.string().required()
    })
};
const deleteTask = {
    query:Joi.object().keys({
        taskId:Joi.string().required()
    })
};

const getDeletedTaskByUser = {
    query:Joi.object().keys({
        userId:Joi.string().required()
    })
};

const getTaskByDate = {
    query:Joi.object().keys({
        userId:Joi.string().required(),
        date:Joi.string().required()
    })
};

const getDeletedTaskByDate = {
    query:Joi.object().keys({
        userId:Joi.string().required(),
        date:Joi.string().required()

    })
};
const updateTask = {
    query:Joi.object().keys({
        taskId:Joi.string().required()
    })
};

module.exports = {
    getTaskByUser,
    deleteTask,
    getDeletedTaskByUser,
    getTaskByDate,
    getDeletedTaskByDate,
    updateTask
}