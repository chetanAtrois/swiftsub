const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
const port = config.port || 4000;

// Cache for serverless environment
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.mongoose.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Use standard write concern
      writeConcern: { w: 'majority', j: true }
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect and start server
dbConnect()
  .then(() => {
    logger.info('✅ Connected to MongoDB');

    server = app.listen(port, () => {
      logger.info(`Server is listening on port ${port}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection failed', err);
    process.exit(1);
  });

// Graceful shutdown
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
  logger.error('Unexpected error', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close(() => logger.info('Server closed after SIGTERM'));
  }
}) ;

