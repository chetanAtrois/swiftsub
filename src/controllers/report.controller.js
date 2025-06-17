const catchAsync = require('../utils/catchAsync');
const reportService = require('../services/report.service');
const { uploadFileS3,uploadFile } = require('../config/upload-image');
const httpStatus = require('http-status');

const createReport = catchAsync(async (req, res) => {
  const files = req.files || {};
  console.log("files data is",files)

  const images = files.images || [];
  const file = files.file?.[0];
  console.log("image files",images);
  console.log("files data is here",file);

  if (!images.length || images.length > 5) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'You must upload between 1 to 5 images.' });
  }
  const imageURIs = await uploadFileS3(images, 'reports/images');
  console.log("imageUri data",imageURIs)
  let fileData = null;
  if (file) {
    const fileUploadResponse = await uploadFile(file, 'reports/files');
    console.log("fileuploadresponse",fileUploadResponse)
    if (fileUploadResponse.success) {
      fileData = {
        uri: fileUploadResponse.imageURI,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      };
    } else {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Failed to upload file.' });
    }
  } else {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'File is required.' });
  }
  const report = await reportService.createReport(req, req, imageURIs, fileData);

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
});

const updateReport = catchAsync(async (req, res) => {
  const files = req.files || {};
  const images = files.images || [];
  const file = files.file?.[0];

  if (!images.length || images.length > 5) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'You must upload between 1 to 5 images.',
    });
  }

  const imageURIsRaw = await uploadFileS3(images, 'reports/images');
  const imageURIs = imageURIsRaw.map(item => item.imageURI); 
  
  req.imageURIs = imageURIs;
  
  if (!file) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: 'File is required.',
    });
  }

  const fileUploadResponse = await uploadFile(file, 'reports/files');
  if (!fileUploadResponse.success) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'Failed to upload file.',
    });
  }

  const fileData = {
    url: fileUploadResponse.imageURI,
    name: file.originalname,
    size: file.size,
    type: file.mimetype,
  };

  // Attach data to req
  req.imageURIs = imageURIs;
  req.fileData = fileData;

  // Update the report
  const report = await reportService.updateReport(req);

  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Report updated successfully.',
    data: report,
  });
});

module.exports = {
  createReport,
  getReports,
  deleteReport,
  updateReport
};
