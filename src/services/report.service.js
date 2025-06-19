const Report = require('../models/report.model');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const mapReportData = (req, data, imageURIs, fileData) => {
  const userId = req.user._id 
  const loggedInUserId = req.user._id;

  if (!imageURIs.length || imageURIs.length > 5) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You must upload between 1 to 5 images.');
  }

  if (!fileData || !fileData.uri) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Report file is required.');
  }

  const report = {
    userId: userId,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId, // Initially both will be same
    isCompleted: false,
    title: data.body.title,
    companyName: data.body.companyName,
    address: data.body.address,
    reportDate: data.body.reportDate,
    reportTime: data.body.reportTime,
    file: {
      name: fileData.name,
      size: fileData.size,
      type: fileData.type,
      url: fileData.uri,
    },
    images: imageURIs.map((file) => file.imageURI),
  };

  if (data.body.notes && data.body.notes.trim() !== '') {
    report.notes = data.body.notes.trim();
  }

  if (data.body.businessSize && data.body.businessSize.trim() !== '') {
    report.businessSize = data.body.businessSize.trim();
  }

  return report;
};


const createReport = async (req, data, imageURIs, fileURI) => {
  const reportData = mapReportData(req, data, imageURIs, fileURI);
  const report = await Report.create(reportData);
  return report;
};

const getReportsByUser = async (userId) => {
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }
  const reports = await Report.find({ userId }).sort({ createdAt: -1 });
  return reports;
};
const mapUpdatedReportData = (req, body, imageURIs, fileData) => {
  const userId = req.user._id;
  console.log("userId",userId);
  if (!imageURIs.length || imageURIs.length > 5) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You must upload between 1 to 5 images.');
  }

  if (!fileData || !fileData.url) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Report file is required.');
  }

  const knownFields = [
    'title',
    'companyName',
    'address',
    'reportDate',
    'reportTime',
    'notes',
    'businessSize',
    'images',
    'file',
  ];

  const updates = {};
  const customFields = {};

  for (const key in body) {
    if (knownFields.includes(key)) {
      updates[key] = body[key];
    } else {
      customFields[key] = body[key];
    }
  }

  if (imageURIs) {
    updates.images = imageURIs;
  }
  if (fileData) {
    updates.file = fileData;
  }

  updates.customFields = customFields;

  return updates;
};

const updateReport = async (req) => {
  const { reportId } = req.query;
  console.log("📌 Report ID:", reportId);
  
  const report = await Report.findById(reportId);
  if (!report) {
    console.error("❌ Report not found in DB");
    throw new ApiError(404, 'Report not found');
  }

  console.log("📝 Existing Report:", report);

  // Step 2: Check permission
  if (report.userId.toString() !== req.user._id.toString()) {
    console.error("🚫 Unauthorized user trying to update report");
    throw new ApiError(403, 'You are not allowed to edit this report');
  }

  // Step 3: Process update
  const updates = mapUpdatedReportData(req, req.body, req.imageURIs, req.fileData);
  updates.updatedBy = req.user._id;
  updates.isCompleted = true;

  console.log("🔧 Updates to be applied:", updates);

  // Step 4: Perform update
  const updatedReport = await Report.findByIdAndUpdate(
    reportId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedReport) {
    console.error("❌ Report update failed");
    throw new ApiError(404, 'Report not found');
  }

  console.log("✅ Report updated successfully:", updatedReport);

  return { data: updatedReport };
};



const deleteReport = async(req)=>{
  const {reportId} = req.query;
  const report = await Report.findOneAndDelete({ _id:reportId});
  if(!report){
    throw new ApiError(httpStatus.BAD_REQUEST,'give valid reporId');
  }
  return report;
};

module.exports = {
  createReport,
  getReportsByUser,
  deleteReport,
  updateReport
};
