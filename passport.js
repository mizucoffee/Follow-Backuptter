const
  config = require('config'),
  passport = require('passport'),
  TwitterStrategy = require('passport-twitter').Strategy;

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
    consumerKey: config.get('api-keys.twitter.ck'),
    consumerSecret: config.get('api-keys.twitter.cs'),
    callbackURL: `http://${config.get('server.domain')}:${config.get('server.port')}/auth/twitter/callback`
  },
  function(token, tokenSecret, profile, done) {    
    profile.token = token;
    profile.tokenSecret = tokenSecret;
    done(null,profile);
  }
));

module.exports = {passport: passport}

