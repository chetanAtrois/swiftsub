const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
let port;

const mongooseOptions = {
  ...config.mongoose.options,
  // Set write concern to majority to ensure writes are acknowledged by majority of nodes
  writeConcern: { w: 'majority' },
};

mongoose.connect(config.mongoose.url, mongooseOptions).then(() => {
  logger.info('Connected to MongoDB');

  port = config.port || 4000;
  server = app.listen(port, () => logger.info(`Listening on port ${port}`));
}).catch(error => {
  logger.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

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
