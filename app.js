'use strict';
const
  config = require('config'),
  express = require("express"),
  session = require('express-session'),
  auth = require('./passport'),
  passport = auth.passport,
  twitter = require('twitter'),
  async = require('async'),
  app = express();

app.use(session({ secret: 'sushi', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

app.disable('x-powered-by');

app.set('view engine', 'ejs');

const server = app.listen(process.env.PORT || config.get('server.port'), function () {
  console.log("Node.js is listening to PORT:" + server.address().port);
});

// ==========================================================

app.get("/", function (req, res, next) {
  res.render("login", { "name": config.get("server.name"), "ver": config.get("server.version") });
});

app.get("/login", function (req, res) {
  if (req.isAuthenticated()) { res.redirect("/list"); } else { res.redirect("/auth/twitter") }
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/list', failureRedirect: '/' }));

app.get('/list', function (req, res) {
  if (!req.isAuthenticated()) { res.redirect("/"); return; }
  res.render("index", { "name": config.get("server.name"), "ver": config.get("server.version") });
});

app.get('/api/list', function (req, res) {
  if (!req.isAuthenticated()) { res.status(403).send('Loading').end(); return; }

  if (!req.session.list && !req.session.loading) { res.status(404).send('Not loaded').end(); return; } // hasn't list
  if (!req.query.page) { res.status(400).send('Need query "page"').end(); return; } // not found query page
  if (isNaN(parseInt(req.query.page)) || parseInt(req.query.page) < 0) { res.status(400).send('Bad query "page"').end(); return; } // bad query page
  if (Math.ceil(req.user._json.friends_count / 100) <= parseInt(req.query.page)) { res.status(400).send('Out of bounds "page"').end(); return; } // bad query page
  if (req.session.list.length == 0 || req.session.list.length - 1 < parseInt(req.query.page)) { res.status(400).send('Not loaded page').end(); return; } // bad query page

  res.status(200).send(req.session.list[req.query.page]).end();
});

//next_cursor

app.get('/api/load', function (req, res) {
  if (!req.isAuthenticated()) { res.status(403).send('Loading').end(); return; }
  if (req.session.loading) { res.status(406).send('Loading').end(); return; }
  if (req.query.force != "true" && req.session.list) { res.status(400).send('Loaded. If you need a reload, you can use a "force" option.').end(); return; }

  req.session.loading = true;
  req.session.loaded = false;

  var client = new twitter({
    consumer_key: config.get('api-keys.twitter.ck'),
    consumer_secret: config.get('api-keys.twitter.cs'),
    access_token_key: req.user.token,
    access_token_secret: req.user.tokenSecret,
  });
  var cursor = -1;
  var users = [];
  req.session.list = [];
  req.session.getLength = 0;

  var getLookup = function (client, users) {
    var b = users.length, cnt = 100, newArr = [];
    for (var i = 0; i < Math.ceil(b / cnt); i++) {
      var j = i * cnt;
      var p = users.slice(j, j + cnt);
      newArr.push(p);
    }

    var process = []

    var i = 0;
    newArr.forEach(function (element, index, array) {
      process.push(function (callback) {
        client.get('users/lookup', { "stringify_ids": true, "user_id": element.join(',') }, function (e, d, r) {
          req.session.list.push(d);
          req.session.getLength += d.length;
          req.session.save();

          console.log("push " + ++i + " " + d.length);
          callback(e, d);
        });
      });
    });

    async.series(process, function (err, results) {
      req.session.loading = false;
      req.session.save();
      if (err) throw err;
    });
  }

  var getIds = function (client, cursor, users, done) {
    client.get('friends/ids', { "screen_name": "parusy168", "stringify_ids": true, "cursor": cursor }, function (error, data, response) {
    // client.get('friends/ids', { "stringify_ids": true, "cursor": cursor }, function (error, data, response) {
      if (!error) {
        console.log("GET IDS " + data.ids.length);
        Array.prototype.push.apply(users, data.ids);
        done(users, data.next_cursor_str);
      };
    });
  };

  var done = function (u, c) {
    cursor = c;
    users = u;
    console.log("next_cursor:" + c);

    if (c == 0) {
      console.log("START LOOKUP");
      getLookup(client, users);
    } else {
      getIds(client, cursor, users, done);
    }
  };

  getIds(client, cursor, users, done);

  res.status(200).send('Load start').end();
});

app.get('/api/get-length', function (req, res) {
  if (!req.isAuthenticated()) { res.status(403).send('Loading').end(); return; }
  if (!req.session.hasOwnProperty("list")) { res.status(404).end(); return; }
  res.send({ "length": req.session.getLength, "pages": req.session.list.length });
});

app.get('/api/user-data', function (req, res) {
  if (!req.isAuthenticated()) { res.status(403).send('Loading').end(); return; }
  res.send(req.user._json);
});

app.get('/api/csv', function (req, res) {
  if (!req.isAuthenticated()) { res.status(403).send('Loading').end(); return; }
  if (req.session.loading) { res.status(406).send('Loading').end(); return; }
  if (!req.session.hasOwnProperty("list")) { res.redirect("/"); return; }

  var csv = "name,screen_name,id\n";
  req.session.list.forEach(function (users) {
    users.forEach(function (user) {
      csv = csv + user.name + "," + user.screen_name + "," + user.id + "\r\n";
    });
  });
  // res.setHeader('Content-disposition', 'attachment; filename=follow_list.csv');
  res.setHeader('Content-type', 'text/csv; charset=utf-8');
  res.send(csv);
});

app.get('/api/logout', function (req, res) {
  req.session.destroy();
  res.redirect("/");
});