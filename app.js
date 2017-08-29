'use strict';
var express = require("express");
var session = require('express-session')
var auth = require('./passport');
var passport = auth.passport;
var routes = require('./routes');

var app = express();

//app.use(require('cookie-parser')());
//app.use(require('body-parser').urlencoded({ extended: true }));
app.use(session({secret: 'sushi',resave: false,saveUninitialized: false}));
app.use(passport.initialize()); 
app.use(passport.session()); 
app.use(express.static('public'));
app.set('view engine', 'ejs');

var server = app.listen(30000, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

routes.configRoutes(app, server, passport);
