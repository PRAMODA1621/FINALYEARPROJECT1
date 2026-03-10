const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const authConfig = require('./auth');
const logger = require('../utils/logger');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: authConfig.google.clientID,
    clientSecret: authConfig.google.clientSecret,
    callbackURL: authConfig.google.callbackURL,
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ 
        where: { 
          google_id: profile.id 
        } 
      });

      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      user = await User.findOne({ 
        where: { 
          email: profile.emails[0].value 
        } 
      });

      if (user) {
        // Link Google account to existing user
        user.google_id = profile.id;
        await user.save();
        return done(null, user);
      }

      // Create new user
      const newUser = await User.create({
        google_id: profile.id,
        email: profile.emails[0].value,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName || '',
        is_active: true
      });

      done(null, newUser);
    } catch (error) {
      logger.error('Google OAuth error:', error);
      done(error, null);
    }
  }
));

module.exports = passport;