const httpStatus = require('http-status');
const Admin = require('../models/admin.model')
const employeeActivityModel = require('../models/employeeActivity.model');
const ApiError = require('../utils/ApiError')

const userCheckIn = async (req) => {
    const existingCheckIn = await employeeActivityModel.findOne({
        employeeId: req.user._id,
        status: "checked-in"
      });
    
      if (existingCheckIn) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User is already checked in");
      }
    const scheduledTime = new Date();
    console.log("nfsnjns",scheduledTime)
    scheduledTime.setHours(9, 0, 0, 0); 
    const actualEmployeeTime = new Date(); 
    const timeDifferenceInMilliseconds = actualEmployeeTime - scheduledTime;
    const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (1000 * 60);
  
    let checkInStatus;
    if (timeDifferenceInMinutes < 0) {
      checkInStatus = "early";
    } else if (timeDifferenceInMinutes === 0) {
      checkInStatus = "on-time";
    } else {
      checkInStatus = "late";
    }
    const user = await employeeActivityModel.create({
      employeeId: req.user._id,
      checkInTime: actualEmployeeTime,
      checkInTimeDifference: timeDifferenceInMinutes,
      checkInStatus,
      status: "checked-in"  
    });
  
    return user;
  };


  const userCheckOut = async (req) => {
    const { employeeActivityId } = req.query;
    const employeeDetails = await employeeActivityModel.findOne({
        employeeId: req.user._id,
        _id: employeeActivityId,
        status: "checked-in"
      });
    
      if (!employeeDetails) {
        throw new ApiError(httpStatus.BAD_REQUEST, "No active check-in found or already checked out");
      }
  
    const timeDiffInMilliseconds = new Date() - new Date(employeeDetails.checkInTime);
    const timeDiffInHours = timeDiffInMilliseconds / (1000 * 60 * 60);
      const employeeCheckout = await employeeActivityModel.findOneAndUpdate(
      {
        employeeId: req.user._id,
        _id: employeeActivityId,
      },
      {
        $set: {
          checkOutTime: new Date(),
          timeDiffInHours,
          status: "checked-out"
        },
      },
      {
        new: true, 
      }
    );
  
    return employeeCheckout;
  };

  const trackerStatus = async (req) => {
    const employeeDetails = await employeeActivityModel.findOne({
      employeeId: req.user._id,
      status: "checked-in"
    });
  
    if (!employeeDetails) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User is not currently checked in");
    }
  
    const currentTime = new Date();
    const checkInTime = new Date(employeeDetails.checkInTime);
    const timeDiffInMilliseconds = currentTime - checkInTime;
  
    const totalMinutes = Math.floor(timeDiffInMilliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return {
      status: "checked-in",
      checkInTime,       
      currentTime,       
      durationWorked: `${hours} hours and ${minutes} minutes`
    };
  };
  
  
  module.exports = {
    userCheckIn,
    userCheckOut,
    trackerStatus
  };
  