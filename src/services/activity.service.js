const httpStatus = require('http-status');
const Admin = require('../models/admin.model')
const employeeActivityModel = require('../models/employeeActivity.model');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const Note = require('../models/note.model');
const Contact = require('../models/contact.model');
const AllowedCheckinPolicy = require('../models/allowedCheckinPolicy.model')
const saveContactAfterCallModel = require('../models/saveContactAfterCall.model');
const Permission = require('../models/permission.model');

const userCheckIn = async (req) => {
  const { adminCheckInTime, adminCheckOutTime, adminWorkingDate } = req.body;

  if (!adminCheckInTime || !adminCheckOutTime || !adminWorkingDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Admin check-in, check-out, and date are required");
  }

  function combineDateAndTime(dateStr, timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(dateStr);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  const adminCheckIn = combineDateAndTime(adminWorkingDate, adminCheckInTime);
  const adminCheckOut = combineDateAndTime(adminWorkingDate, adminCheckOutTime);

  if (isNaN(adminCheckIn) || isNaN(adminCheckOut)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid admin check-in or check-out time format");
  }

  const now = new Date();
  const timeDifferenceInMinutes = (now - adminCheckIn) / (1000 * 60);

  let checkInStatus = "on-time";
  if (timeDifferenceInMinutes < 0) checkInStatus = "early";
  else if (timeDifferenceInMinutes > 0) checkInStatus = "late";

  const newCheckIn = await employeeActivityModel.create({
    employeeId: req.user._id,
    checkInTime: now,
    checkInTimeDifference: timeDifferenceInMinutes,
    checkInStatus,
    status: "checked-in",
    adminCheckInTime: adminCheckIn,
    adminCheckOutTime: adminCheckOut,
    adminWorkingDate: new Date(adminWorkingDate),
  });

  return newCheckIn;
};





const userCheckOut = async (req) => {
  const { employeeActivityId } = req.query;

  const employeeDetails = await employeeActivityModel.findOne({
    employeeId: req.user._id,
    _id: employeeActivityId,
    status: "checked-in",
  });
  console.log("employeeDetails",employeeDetails)

  if (!employeeDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No active check-in found or already checked out");
  }

  const userCheckIn = new Date(employeeDetails.checkInTime);
  const userCheckOut = new Date();
  console.log("userCheckOut",userCheckOut)

  const actualDuration = (userCheckOut - userCheckIn) / (1000 * 60 * 60); // in hours
  console.log("actualDuration",actualDuration)


  const adminCheckIn = new Date(employeeDetails.adminCheckInTime);
  const adminCheckOut = new Date(employeeDetails.adminCheckOutTime);
  const expectedDuration = (adminCheckOut - adminCheckIn) / (1000 * 60 * 60);
  console.log("adminCheckIn",adminCheckIn)
  console.log("adminCheckOut",adminCheckOut)
  console.log("expectedDuration",expectedDuration)


  const lateCheckIn = Math.max(0, (userCheckIn - adminCheckIn) / (1000 * 60)); // in minutes
  const earlyCheckOut = Math.max(0, (adminCheckOut - userCheckOut) / (1000 * 60)); // in minutes
  console.log("lateCheckIn",lateCheckIn)
  console.log("earlyCheckOut",earlyCheckOut)

  let overwork = 0;
  let underwork = 0;

  if (actualDuration > expectedDuration) {
    overwork = actualDuration - expectedDuration;
  } else {
    underwork = expectedDuration - actualDuration;
  }

  const updated = await employeeActivityModel.findOneAndUpdate(
    { employeeId: req.user._id, _id: employeeActivityId },
    {
      $set: {
        checkOutTime: userCheckOut,
        timeDiffInHours: actualDuration,
        status: "checked-out",
        lateCheckInMinutes: lateCheckIn,
        earlyCheckOutMinutes: earlyCheckOut,
        overworkHours: overwork,
        underworkHours: underwork,
      },
    },
    { new: true }
  );
  console.log("updated",updated)
  return updated;
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
  
    if (timeDiffInMilliseconds < 0) {
      return {
        message: "Your check-in time is in the future. Please wait until check-in time.",
        status: "checked-in",
        checkInTime,
        currentTime
      };
    }
  
    const totalMinutes = Math.floor(timeDiffInMilliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return {
      message:"You are checkedIn and your timer is running",
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

  const getLocationHistoryByDate = async (req) => {
    const { userId, date } = req.query;
  
    if (!userId || !date) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User ID and date are required");
    }
  
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format. Use yyyy-mm-dd");
    }
  
    const user = await User.findById(userId).select("locationHistory");
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
  
    const locationList = user.locationHistory.filter(loc => {
      const locDate = new Date(loc.timestamp).toISOString().split("T")[0];
      return locDate === date;
    }).map(loc => ({
      latitude: loc.coordinates[1],
      longitude: loc.coordinates[0]
    }));
  
    const timing = await employeeActivityModel.find({
      employeeId: userId,
      checkInTime: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lte: new Date(`${date}T23:59:59.999Z`)
      }
    }).select('checkInTime checkOutTime createdAt updatedAt').sort({ checkInTime: -1 });
    return {
      success: true,
      userId,
      locationHistoryData: {
        [date]:{
        locations: locationList,
        timing
        }
      }
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
    const { activityId, passcode } = req.body;
  
    if (!activityId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Activity ID is required');
    }
  
    const currentTime = new Date();
    const predefinedPasscode = '666666'; 
  
    if (passcode !== predefinedPasscode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Passcode does not match');
    }
  
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
  const createNotes = async(req)=>{
    const user = await User.findOne({
      _id:req.user._id
    })
    const{title,description} = req.body;
    console.log("userId",user);
    
    if(!user){
      throw new Error('No user Found');
    }
    const noteSection = await Note.create({
      employeeId:user._id,
      title:req.body.title,
      description:req.body.description
    });
    return noteSection;
  };

  const getNotes = async(req)=>{
    const {userId} = req.query;
    const user = await Note.find({employeeId:userId}).sort({ createdAt: -1 });
    if(!user){
      throw new Error('userId is required')
    }
    return user;
  };

  const saveContact = async (req) => {
    const user = await User.findOne({
      _id:req.user._id
    })
    console.log("userId",user);
  
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No user found');
    }
  
    const contactEntry = {
      contactName: req.body.contactName,
      contactNumber: req.body.contactNumber,
      contactNote: req.body.contactNote,
      contactEmail: req.body.contactEmail
    };
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === '') {
        delete req.body[key];
      }
    });
    await Contact.findOneAndUpdate(
      { employeeId: user._id },
      {
        $push: { contactDetails: contactEntry }
      },
      { upsert: true, new: true } 
    );
    return {
      contactDetails: contactEntry
    };
  };
  const saveContactAfterCall = async (req) => {
    const user = await User.findOne({
      _id:req.user._id
    })
    console.log("userId",user);
  
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No user found');
    }
  
    const contactEntry = {
      contactName: req.body.contactName,
      contactNumber: req.body.contactNumber,
      contactNote: req.body.contactNote,
      contactEmail: req.body.contactEmail,
      contactCompanyName: req.body.contactCompanyName,
      contactProfile: req.body.contactProfile,
      purpose: req.body.purpose,
    };
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === '') {
        delete req.body[key];
      }
    });
    console.log("contactEntry",contactEntry);

    const logger = await saveContactAfterCallModel.findOneAndUpdate(
      { employeeId: user._id },
      {
        $push: { contactDetails: contactEntry }
      },
      { upsert: true, new: true } 
    );
    console.log("logger",logger);
    return {
      contactDetails: contactEntry
    };
  };

  const getContact = async(req)=>{
    const {userId} = req.query;
    const user = await Contact.find({employeeId:userId}).sort({ createdAt: -1 });;
    if(!user){
      throw new Error('userId is required');
    }
    return user
  };

  const getCheckinPolicyTime = async (req) => {
    const { date,userId } = req.query;
  
    if (!userId || !date) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'please give UserId and date');
    }
  
    const policy = await AllowedCheckinPolicy.findOne({ userId, date });
    if (!policy) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No checkinTime and checkOutTime found with this date');
    }
    console.log("policy document:", policy);

  
    return ({
      allowedCheckInTime: policy.allowedCheckInTime,
      allowedCheckOutTime:policy.allowedCheckOutTime,
      date: policy.date
    });
  };

  const getMyPermissions = async (req) => {
    const userId = req.user._id;
    const userPermission = await Permission.findOne({ userId }).select('permissions');
    if (!userPermission) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No permissions found for this user');
    }
    return userPermission;
  };

  const getMyContacts = async (req) => {
    const employeeId = req.user._id;
    const getContact = await saveContactAfterCallModel.findOne({ employeeId }).select('contactDetails');
    if (!getContact) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No contact found for this user');
    }
    return getContact;
  };

  
  module.exports = {
    userCheckIn,
    userCheckOut,
    trackerStatus,
    updateLocation,
    getUserLocation,
    getLocationHistory,
    turnOffAlarm,
    autoTurnOffAlarm,
    createNotes,
    getNotes,
    saveContact,
    getContact,
    getLocationHistoryByDate,
    getCheckinPolicyTime,
    saveContactAfterCall,
    getMyPermissions,
    getMyContacts
  };
  