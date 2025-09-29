const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
let port;

// MongoDB connection cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongooseOptions = {
      ...config.mongoose.options,
      writeConcern: { w: 'majority' },
      serverSelectionTimeoutMS: 10000, // optional to increase timeout
    };
    cached.promise = mongoose.connect(config.mongoose.url, mongooseOptions).then(mongoose => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

async function startServer() {
  try {
    await connectToDatabase();
    logger.info('Connected to MongoDB');

    port = config.port || 4000;
    server = app.listen(port, () => logger.info(`Listening on port ${port}`));
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
