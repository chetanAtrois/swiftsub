const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
const port = config.port || 4000;

// Connect to MongoDB
mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('✅ Connected to MongoDB');

    // Start server and assign to variable
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

// Unexpected errors
const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected error', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// SIGTERM (used by platforms like Heroku or Vercel)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close(() => logger.info('Server closed after SIGTERM'));
  }
});

