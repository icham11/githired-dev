const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        let user = await User.findOne({ where: { googleId } });

        if (user) {
          return done(null, user);
        }

        user = await User.findOne({ where: { email } });

        if (user) {
          user.googleId = googleId;
          await user.save();
          return done(null, user);
        }

        user = await User.create({
          username: profile.displayName || email.split("@")[0],
          email: email,
          password: "GOOGLE_LOGIN_" + Math.random().toString(36).substring(7), // Dummy password
          googleId: googleId,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

module.exports = passport;
