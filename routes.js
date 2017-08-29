'use strict';
var configRoutes;
var twitter = require('twitter');var twitter = require('twitter');

configRoutes = function(app, server, passport) {

  app.get("/", function(req, res, next){
    res.render("login", {});
  });

  app.get('/auth/twitter', passport.authenticate('twitter'));

  app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/list', failureRedirect: '/' }));

  app.get('/list', function(req, res){
    var client = new twitter({
        consumer_key:        process.env.CONSUMER_KEY,
        consumer_secret:     process.env.CONSUMER_SECRET,
        access_token_key:    req.user.token,
        access_token_secret: req.user.tokenSecret,
    });    
    client.get('friends/ids', {}, function(error, data, response){
        if (!error) {
           var b = data.ids.length, cnt = 100,newArr = [];
           for(var i = 0; i < Math.ceil(b / cnt); i++) {
             var j = i * cnt;
             var p = data.ids.slice(j, j + cnt);
             newArr.push(p);
           }
           var users = []; 
           newArr.forEach(function(element,index,array){
             client.get('users/lookup',{user_id:element.join(',')},function(e,d,r){
               if(!error){
                 console.log(d);
               }else{
                 console.log(error);
               }
             });
           });
           users.forEach(function(d){console.log(d.screen_name)});
           res.render("index",{profile:req.user._json,users:users});
        }
    });
  });

}

module.exports = {configRoutes: configRoutes};
