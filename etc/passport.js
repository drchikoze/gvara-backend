/* istanbul ignore next */
// var GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy  = require('passport-facebook').Strategy;

// load the auth variables
var configAuth = require('./config').social; // use this one for testing

module.exports = function(passport) {

    passport.serializeUser(function(account, done) {
        done(null, account.id);
    });

    passport.deserializeUser(function(id, done) {
        Account.findById(id, function(err, account) {
            done(err, account);
        });
    });

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    // passport.use(new GoogleStrategy({
    //     clientID          : configAuth.googleAuth.clientID,
    //     clientSecret      : configAuth.googleAuth.clientSecret,
    //     callbackURL       : configAuth.googleAuth.callbackURL,
    //     profileFields     : [ 'birthday' ],
    //     passReqToCallback : true
    // },
    // function(req, token, refreshToken, profile, done) {
    //     process.nextTick(function() {
    //         profile.token = token;
    //         return done(null, profile)
    //     });
    // }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
        clientID          : configAuth.facebookAuth.clientID,
        clientSecret      : configAuth.facebookAuth.clientSecret,
        callbackURL       : configAuth.facebookAuth.callbackURL,
        profileFields     : [ 'displayName', 'photos', 'emails', 'birthday', 'gender', 'profileUrl'],
        passReqToCallback : true
    },
    function(req, token, refreshToken, profile, done) {
        console.log('FacebookStrategy');
        process.nextTick(function() {
            profile.token = token;
            return done(null, profile);
        });
    }));
};
