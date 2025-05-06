const catchAsync = require('../utils/catchAsync');
const reportService = require('../services/report.service');
const { uploadFileS3 } = require('../config/upload-image');
const httpStatus = require('http-status');

const createReport = catchAsync(async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'At least one image is required.' });
  }

  const imageURIs = await uploadFileS3(files, 'reports');
  console.log('Authenticated user:', req.user);  

  const report = await reportService.createReport(req, req, imageURIs);  

  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Report created successfully.',
    data: report,
  });
});

const getReports = catchAsync(async (req, res) => {
  const userId = req.query.userId;
  const reportList = await reportService.getReportsByUser(userId);
  res.status(httpStatus.OK).send({ success: true, reportList });
});

const deleteReport = catchAsync(async(req,res)=>{
  const deletedReport = await reportService.deleteReport(req);
  res.status(httpStatus.OK).send({success:true,deletedReport});
})


module.exports = {
  createReport,
  getReports,
  deleteReport
};
