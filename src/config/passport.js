const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User, Admin } = require('../models');

// JWT verification options
const jwtOptions = {
  secretOrKey: config.jwt.secret, // Secret key from config
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header
};

// JWT verification callback
const jwtVerify = async (payload, done) => {
  try {
    // Verify token type (must be ACCESS token)
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    let user;
    // Check user type and fetch from appropriate model
    switch (payload.userType) {
      case 'user':
        user = await User.findById(payload.sub); // Find user by ID
        break;
      default:
        throw new Error('Invalid user type');
    }

    if (!user) {
      return done(null, false); // User not found
    }
    done(null, {...user.toObject(), role: payload.userType}); // Authentication success
  } catch (error) {
    done(error, false); // Authentication error
  }
};

// Create JWT strategy instance
const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy, // Export for use in Passport middleware
};