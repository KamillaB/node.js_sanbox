var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport  = require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');
var signup      = require('./api/signup/v1/signup');
 
// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());
 

console.log('server.js ' + signup );
 
// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);

// connect to database
mongoose.connect(config.database);

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.on('connected', function(){

  console.log('db connected');

})
 
// pass passport for configuration
require('./config/passport')(passport);
 
// bundle our routes
var apiRoutes = express.Router();
console.log('express.apiRoutes ' + apiRoutes )
 
// create a new user account (POST http://localhost:8080/api/signup)

apiRoutes.post('/signup', function(req, res) {
  console.log('server.js /api/signup/')
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
  } else {
    //console.log(User);
    var newUser = new User({
      name : 'teszt',
      username: req.body.username,
      password: req.body.password,
      date_created: Date.now(),
      date_updated: Date.now()

    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: err});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    username : req.body.username,
  }, function(err, user) {
    console.log('server.js: authenticate: ' + user)
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: user.password + " " + req.body.password});
        }
      });
    }
  });
});



getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};


  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
// ...
 
// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  console.log('TOKEN: ' + token)
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    console.log('decoded ' + decoded)
    User.findOne({
      username: decoded.username
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});
// connect the api routes under /api/*
app.use('/api', apiRoutes);
//app.use('/signup', signup);


module.exports = app;