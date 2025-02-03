const passport = require('passport');
require('../app')
module.exports = app => {
    app.get('/google',
        passport.authenticate('google',
            {
                scope: ['email', 'profile']
            }));

    app.get('/google/callback',
        passport.authenticate('google', {
            successRedirect: process.env.GOOGLE_SUCCESS_REDIRECTION_URL,
            failureRedirect: process.env.UI_FAILURE_URL // Social auth failed screen in UI
        }));

    app.get('/azure',
        passport.authenticate('oauth2', {
            scope: ['openid', 'profile', 'offline_access', 'User.Read']
        })
    );

    app.get('/auth/openid/return',
        passport.authenticate('oauth2', {
            successRedirect: process.env.AZURE_SUCCESS_REDIRECTION_URL,
            failureRedirect: process.env.UI_FAILURE_URL // Social auth failed screen in UI
        }),
    );
}
