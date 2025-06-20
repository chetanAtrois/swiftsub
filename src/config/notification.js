const admin = require('firebase-admin');
const firebaseConfig = require('./firebase-admin');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});
const sendNotification = async (message) => {
  try{
    return admin.messaging().send(message);
  }catch(err) {
    throw new ApiError(httpStatus.NOT_FOUND, err.message);
  }
};
module.exports = sendNotification;