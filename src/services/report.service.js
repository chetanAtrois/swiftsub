const Report = require('../models/report.model');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const mapReportData = (req, data, imageURIs, fileData) => {
  const userId = req.user._id;

  if (!imageURIs.length || imageURIs.length > 5) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You must upload between 1 to 5 images.');
  }

  if (!fileData || !fileData.uri) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Report file is required.');
  }

  return {
    userId: userId,
    companyName: data.body.companyName,
    address: data.body.address,
    notes: data.body.notes,
    reportDate: data.body.reportDate,
    reportTime: data.body.reportTime,
    businessSize: data.body.businessSize,

    file: {
      name: fileData.name,
      size: fileData.size,
      type: fileData.type,
      url: fileData.uri,
    },

    images: imageURIs.map((file) => file.imageURI),
  };
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
  deleteReport
};
