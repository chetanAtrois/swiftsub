const httpStatus = require('http-status');
const Admin = require('../models/admin.model')
const employeeActivityModel = require('../models/employeeActivity.model');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');

const userCheckIn = async (req) => {
  const { checkInDate, checkInTime } = req.body;

  const existingCheckIn = await employeeActivityModel.findOne({
    employeeId: req.user._id,
    status: "checked-in",
  });

  if (existingCheckIn) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is already checked in");
  }

  const istCheckIn = new Date(`${checkInDate}T${checkInTime}:00+05:30`);

  const now = new Date();

  console.log("User selected check-in datetime:", istCheckIn.toISOString());
  console.log("Current datetime (server):", now.toISOString());

  if (istCheckIn < now) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Check-in time must be in the future");
  }

  const scheduledTime = new Date(`${checkInDate}T09:00:00+05:30`);
  const timeDifferenceInMinutes = (istCheckIn - scheduledTime) / (1000 * 60);

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
    checkInTime: istCheckIn,
    checkInTimeDifference: timeDifferenceInMinutes,
    checkInStatus,
    status: "checked-in",
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
  const updateLocation = async (req) => {
    const { userId, latitude, longitude } = req.body;
    if (!userId || latitude == null || longitude == null) {
      throw new ApiError(httpStatus.BAD_REQUEST, "please give proper valid data");
    }
    const timestamp = new Date();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        lastUpdated: timestamp,
        $push: {
          locationHistory: {
            $each: [{
              coordinates: [longitude, latitude],
              timestamp: timestamp
            }],
            $slice: -120,
          },
        },
      },
      { new: true }
    );
    const formattedUser = {
      ...updatedUser.toObject(),
      location: {
        latitude: updatedUser.location.coordinates[1],
        longitude: updatedUser.location.coordinates[0]
      },
      locationHistory: updatedUser.locationHistory.map(loc => ({
        latitude: loc.coordinates[1],
        longitude: loc.coordinates[0],
        timestamp: loc.timestamp
      }))
    };
    return formattedUser;
  };
  
  const getLocationHistory = async (req) => {
    const { userId } = req.query;
  
    if (!userId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required");
    }
  
    const user = await User.findById(userId).select("locationHistory");
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    const groupedByDate = {};
    user.locationHistory.forEach(loc => {
      const dateKey = new Date(loc.timestamp).toISOString().split("T")[0];
  
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          locations: [],
          timing: []
        };
      }
  
      groupedByDate[dateKey].locations.push({
        latitude: loc.coordinates[1],
        longitude: loc.coordinates[0]
      });
    });
  
    const timing = await employeeActivityModel.find({ employeeId: userId })
      .select('checkInTime checkOutTime createdAt updatedAt')
      .sort({ checkInTime: -1 });
  
      timing.forEach(log => {
      const dateKey = new Date(log.checkInTime || log.createdAt).toISOString().split("T")[0];
  
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          locations: [],
          timing: []
        };
      }
  
      groupedByDate[dateKey].timing.push(log);
    });
  
    return {
      userId,
      historyByDate: groupedByDate
    };
  };
  
  
  const getUserLocation = async (req) => {
    const { userId, date } = req.query;
  
    if (!userId || !date) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User ID and date are required');
    }
  
    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);
    const user = await User.findById(userId).select('locationHistory');
  
    if (!user || !user.locationHistory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found or no location history');
    }
  
    const filteredHistory = user.locationHistory.filter((entry) => {
      const entryTime = new Date(entry.timestamp);
      return entryTime >= targetDate && entryTime < nextDate;
    });
  
    const formattedHistory = filteredHistory.map((entry) => ({
      latitude: entry.coordinates[1],
      longitude: entry.coordinates[0],
      
    }));
  
    return {
      userId,
      date,
      totalLocations: formattedHistory.length,
      locationHistory: formattedHistory,
    };
  };

  const turnOffAlarm = async (req) => {
    const { activityId } = req.body;
  
    if (!activityId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Activity ID is required');
    }
  
    const currentTime = new Date();
  
    await employeeActivityModel.updateOne(
      { _id: activityId },
      {
        $push: {
          alarmLogs: {
            time: currentTime,
            turnedOffBy: 'user'
          }
        }
      }
    );
  
    return {
      success: true,
      message: "Alarm turned off successfully",
      data: {
        time: currentTime,
        turnedOffBy: "user"
      }
    };
  };
  
  
  const autoTurnOffAlarm = async (req) => {
      const { activityId } = req.body;
  
      if (!activityId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'activityId ID is required');
      }
  
      const currentTime = new Date();
  
      await employeeActivityModel.updateOne(
        { _id: activityId },
        {
          $push: {
            alarmLogs: {
              time: currentTime,
              turnedOffBy: 'system'
            }
          }
        },
        { upsert: true }
      );
  
      return{
        success: true,
        message: "Alarm auto turned off by system",
        data: {
          time: currentTime,
          turnedOffBy: "system"
        }
      };
  };
  
  
  
  module.exports = {
    userCheckIn,
    userCheckOut,
    trackerStatus,
    updateLocation,
    getUserLocation,
    getLocationHistory,
    turnOffAlarm,
    autoTurnOffAlarm
  };
  