var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

var users={}

passport.serializeUser(function(user, done) {
    users[user.id] = user;
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    if (!users[id]){
        done(true,users[id]);
    }   
    done(null, users[id]);
});


passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: "http://192.168.50.50:30001/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {    
    profile.token = token;
    profile.tokenSecret = tokenSecret;
    done(null,profile);
  }
));

module.exports = {passport: passport}

