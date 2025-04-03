const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

// JWT verification callback with role-based permission checking
const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  // Handle authentication errors
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  req.user = user; // Attach user to request object

  // Check if route requires specific permissions
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => 
      userRights.includes(requiredRight)
    );
    
    if (!hasRequiredRights) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }
  resolve();
};

// Higher-order function for role-based authentication
const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      // Passport JWT authentication with custom callback
      passport.authenticate(
        'jwt', 
        { session: false }, 
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next()) // Proceed if authenticated
      .catch((err) => next(err)); // Forward errors
  };

module.exports = auth;