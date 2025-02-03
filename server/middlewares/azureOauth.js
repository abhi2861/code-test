const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const axios = require('axios');
const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" });

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

const config = {
    clientID: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    callbackURL: process.env.AZURE_CALLBACK_URL,
    authorizationURL: process.env.AZURE_AUTHORIZATION_URL,
    tokenURL: process.env.AZURE_TOKEN_URL,
    scope: ['openid', 'profile', 'offline_access', 'User.Read'],
};


// Function to get user details from Microsoft Graph API
const getUserDetails = (accessToken) => {
    const url = process.env.AZURE_ACCESS_TOKEN_URL
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };
    return axios.get(url, { headers })
        .then(response => response.data)
        .catch(error => {
            // Handle error
            throw new Error(error.message);
        });
};

const generateRefreshToken = async (refreshToken) => {
    const tokenUrl = process.env.AZURE_TOKEN_URL;
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', process.env.AZURE_CLIENT_ID);
    params.append('client_secret', process.env.AZURE_CLIENT_SECRET);
    params.append('refresh_token', refreshToken);


    return axios.post(tokenUrl, params)
        .then(response => response.data)
        .catch(error => {
            throw new Error(error.message);
        });
};

passport.use('oauth2', new OAuth2Strategy(config, async (accessToken, refreshToken, profile, cb) => {
    try {
        profile = await getUserDetails(accessToken);
        profile.accessToken = accessToken;
        return cb(null, profile);
    } catch (error) {
        if (error.response && error.response.status === 401 && refreshToken) {
            try {
                const tokenData = await generateRefreshToken(refreshToken);
                // Update accessToken and refreshToken in profile object
                profile.accessToken = tokenData.access_token;
                profile.refreshToken = tokenData.refresh_token;
                // Retry getUserDetails with new accessToken
                profile = await getUserDetails(profile.accessToken);
                profile.accessToken = accessToken;
                return cb(null, profile);
            } catch (refreshError) {
                return cb(refreshError);
            }
        } else {
            return cb(error);
        }
    }
}));

module.exports = passport;
