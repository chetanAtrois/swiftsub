const sendNotifications = require('../config/notification');
const Notification = require('../models/notification.model'); 
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const User = require('../models/user.model');
const subAdmin = require('../models/subAdmin.model');
const fs = require('fs');
const { OpenAI } = require('openai');
const {uploadFile} = require('../config/upload-image'); // adjust path to your upload logic
const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });
const path = require('path');
const { exec } = require('child_process');

const pushNotification = async (req) => {
  const {
    senderId,
    receiverId,
    senderUserType,
    receiverUserType,
    title,
    message,
    notificationType,
  } = req.body;

  if (!receiverId || !receiverUserType) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Receiver ID and user type are required');
  }

  let receiver = await User.findById(receiverId).lean();
    if(!receiver){
      receiver = await subAdmin.findById(receiverId).lean();
    }
  if (!receiver || typeof receiver.fcmToken !== 'string' || !receiver.fcmToken.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'FCM token not found for the receiver');
  }

  const fcmMessage = {
    notification: {
      title,
      body: message,
    },
    data: {
      senderId,
      receiverId,
      title,
      body: message,
      notificationType,
    },
    token: receiver.fcmToken,
  };

  const notificationResult = await sendNotifications(fcmMessage);

  // Save single notification document
  await Notification.create({
    userId: receiverId,
    userType: receiverUserType,
    title,
    message,
    notificationType,
    notificationSender: senderId,
    senderUserType,
    notificationCreatedAt: new Date(),
    read: false, // explicitly default
  });

  return {
    message: 'Notification sent and saved in DB',
    result: notificationResult,
  };
};


const getNotification = async (req) => {
  const { userId } = req.query;

  if (!userId) {
    throw new Error("User ID is required");
  }

  const userNotifications = await Notification.find({ userId }).sort({ createdAt: -1 });

  if (!userNotifications) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No Notification found for this user');
  }

  return userNotifications;
};
const markNotificationAsRead = async (req) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  const result = await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true } }
  );

  if (result.modifiedCount === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No unread notifications found for this user');
  }

  return {
    message: 'All unread notifications marked as read',
    updatedCount: result.modifiedCount,
  };
};




const speechToText = async (req) => {
  console.log("🎙️ Starting speech to text processing...");

  const audio = req.files?.file?.[0];
  if (!audio) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Audio file is required');
  }

  const originalPath = audio.path;
  const convertedPath = path.join(__dirname, '..', 'temp', `${Date.now()}.mp3`);

  console.log("📁 Received file:", audio.originalname);
  console.log("🔄 Converting file with ffmpeg...");

  // Convert to mp3 with ffmpeg
  await new Promise((resolve, reject) => {
    exec(
      `ffmpeg -i "${originalPath}" -ar 16000 -ac 1 -c:a libmp3lame "${convertedPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("❌ FFmpeg error:", stderr);
          return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to convert audio'));
        }
        console.log("✅ Audio converted successfully");
        resolve();
      }
    );
  });

  console.log("⬆️ Uploading audio to S3...");
  const uploadResponse = await uploadFile(
    { path: convertedPath, originalname: audio.originalname, filename: path.basename(convertedPath) },
    'speech/audio'
  );

  if (!uploadResponse.success) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload file');
  }

  const audioUrl = uploadResponse.imageURI;
  console.log("✅ Audio uploaded to S3:", audioUrl);

  console.log("🧠 Sending audio to OpenAI Whisper for transcription...");
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(convertedPath),
    model: 'whisper-1',
    response_format: 'json',
  });

  console.log("📝 Transcription done:", transcription.text);

  // Cleanup
  fs.unlink(originalPath, () => {});
  fs.unlink(convertedPath, () => {});

  return {
    audioUrl,
    transcript: transcription.text,
    message: 'Transcription completed successfully.',
  };
};

const textToSpeech = async (req) => {
  const { text } = req.body;

  if (!text) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Text is required');
  }

  console.log("🧠 Generating speech from text...");

  const outputPath = path.join(__dirname, '..', 'temp', `${Date.now()}-tts.mp3`);

  const response = await openai.audio.speech.create({
    model: 'tts-1', 
    voice: 'alloy', 
    input: text,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);

  console.log("✅ Audio generated with TTS");

  const uploadResponse = await uploadFile(
    {
      path: outputPath,
      originalname: 'tts.mp3',
      filename: path.basename(outputPath),
    },
    'speech/tts'
  );

  fs.unlinkSync(outputPath);

  if (!uploadResponse.success) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload TTS audio');
  }

  console.log("✅ TTS audio uploaded:", uploadResponse.imageURI);

  return {
    ttsAudioUrl: uploadResponse.imageURI,
    text:req.body.text,
    message: 'Text-to-speech audio generated successfully.',
  };
};

module.exports = {
  pushNotification,
  getNotification,
  markNotificationAsRead,
  speechToText,
  textToSpeech
};
