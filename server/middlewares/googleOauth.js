const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport')
const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" });

// this is the important code for passport setup and Google OAuth2 strategy setup
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

const config = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
};


passport.use(new GoogleStrategy(config, async (request, accessToken, refreshToken, profile, done) => {
    // verify the user's profile and authentication details
    request.session.accessToken = accessToken;
    request.session.refreshToken = refreshToken;
    profile.accessToken = accessToken;
    return done(null, profile);
}));

