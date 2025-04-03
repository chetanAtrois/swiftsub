const morgan = require('morgan');
const config = require('./config');
const logger = require('./logger');

// Custom token to capture error messages from response locals
morgan.token('message', (req, res) => res.locals.errorMessage || '');

// Format IP based on environment (production vs. development)
const getIpFormat = () => (config.env === 'production' ? ':remote-addr - ' : '');

// Define log formats for success and error responses
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

// Morgan middleware for successful responses (status < 400)
const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,  // Ignore errors
  stream: { write: (message) => logger.info(message.trim()) },  // Log to info level
});

// Morgan middleware for error responses (status >= 400)
const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,  // Ignore successes
  stream: { write: (message) => logger.error(message.trim()) },  // Log to error level
});

module.exports = {
  successHandler,
  errorHandler,
};