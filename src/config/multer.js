const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('./config');

AWS.config.update({
  accessKeyId: config.aws.accessId,
  secretAccessKey: config.aws.secretKey,
  region: config.aws.region
});


const s3 = new AWS.S3();


const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.aws.bucketName,
    acl: 'public-read',
    key: (req, file, cb) => {
      const fileName = `uploads/${Date.now()}-${file.originalname}`;
      console.log('Uploading file:', fileName);
      cb(null, fileName);
    }
  })
});

module.exports = upload;
