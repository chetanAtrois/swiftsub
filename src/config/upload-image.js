const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const config = require('./config');
const fs = require('fs');
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const s3 = new S3Client({
    region: config.aws.region, 
  });
  

async function uploadFile(file, folder = 'uploads') {
  const fileStream = fs.createReadStream(file?.path);
  const fileExtension = file.originalname.split('.').pop();

  const uploadParams = {
    Bucket: config.aws.bucketName,
    Body: fileStream,
    Key: `${folder}/${file.filename}.${fileExtension}`,
    ACL: 'public-read',
  };

  const command = new PutObjectCommand(uploadParams);

  try {
    const data = await s3.send(command);
    return { success: true, imageURI: `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${uploadParams.Key}` };
  } catch (err) {
    console.error("Error uploading file:", err);
    return { success: false };
  }
}

async function uploadFileS3(files, folder = 'uploads') {
  if (!Array.isArray(files)) files = [files];

  const uploadPromises = files.map(async (file) => {
    try {
      const imageResponse = await uploadFile(file, folder);
      await unlinkFile(file.path); 
      return imageResponse;
    } catch (err) {
      console.error("Error uploading file:", err);
      return { success: false };
    }
  });

  return Promise.all(uploadPromises);
}

module.exports = {
  uploadFileS3,
  uploadFile
};
