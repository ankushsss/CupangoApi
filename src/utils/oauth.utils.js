const passport = require('passport');



const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
            const GOOGLE_CLIENT_ID = '824949727002-0ohjlupiqjq8r43nopa8g2sgomu7qs8h.apps.googleusercontent.com';
            const GOOGLE_CLIENT_SECRET = 'hgOY9QvaYp93rIs6VqWbs_Om';
            passport.use(new GoogleStrategy({
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:3000/auth/google/callback"
          },
           function(accessToken, refreshToken, profile, done) {
            userProfile=profile;
            return done(null, userProfile);
            
  }
));


const oauth = () => {
    return async function (req, res, next) {
        try {
            
            passport.authenticate('google', { scope : ['profile', 'email'] });
            next();

        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}

module.exports = oauth;