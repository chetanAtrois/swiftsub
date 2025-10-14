const aws = require ('aws-sdk');
const multer = require ('multer');
const multerS3 = require ('multer-s3');
const config = require ('./config');

aws.config.update({
  accessKeyId: config.aws.accessId,
  secretAccessKey: config.awssecretKey,
  region: config.aws.region,
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.aws.bucketName,
    acl: 'public', 
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `profile-pictures/${Date.now()}-${file.originalname}`);
    },
  }),
});

module.exports = upload;