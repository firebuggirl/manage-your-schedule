const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mid = require('../middleware');

//const methodOverride = require('method-override');//use this Eventdleware to be able to conduct a put request on a form to update data
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');
const flash = require('connect-flash');
require('dotenv').config({ path: '../constiables.env' });

const todoController = require('../controllers/todoController');
const passport = require('passport');
passport.initialize();

 //const FacebookStrategy = require('passport-facebook').FacebookStrategy;
const Strategy = require('passport-facebook').Strategy;

 passport.use(new Strategy({
     clientID: process.env.FACEBOOK_CLIENT_ID,
     clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
     callbackURL: '//localhost:3002/auth/facebook/callback',
      profileFields: ['id', 'email', 'name']
   },
   function(accessToken, refreshToken, profile, cb) {
     // In this example, the user's Facebook profile is supplied as the user
     // record.  In a production-quality application, the Facebook profile should
     // be associated with a user record in the application's database, which
     // allows for account linking and authentication with other identity
     // providers.
     return cb(null, profile);
   }));


 // Configure Passport authenticated session persistence.
 //
 // In order to restore authentication state across HTTP requests, Passport needs
 // to serialize users into and deserialize users out of the session.  In a
 // production-quality application, this would typically be as simple as
 // supplying the user ID when serializing, and querying the user record by ID
 // from the database when deserializing.  However, due to the fact that this
 // example does not have a database, the complete Facebook profile is serialized
 // and deserialized.
 passport.serializeUser(function(user, cb) {
   cb(null, user);
 });

 passport.deserializeUser(function(obj, cb) {
   cb(null, obj);
 });

 // Use application-level Eventdleware for common functionality, including
 // logging, parsing, and session handling.
 router.use(require('morgan')('combined'));
 router.use(require('cookie-parser')());
 router.use(require('body-parser').urlencoded({ extended: true }));
 router.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
 router.use(flash());
 // Initialize Passport and restore authentication state, if any, from the
 // session.
 router.use(passport.initialize());
 router.use(passport.session());

 router.use(function (req, res, next) {
   res.locals.currentUser = req.session.userId;
   res.locals.currentUserFb = req.user;
   next();
 });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/create', mid.requiresLogin, function(req, res, next) {
  return res.render('create', { title: 'Create Event' });
});


// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', { title: 'Log In'});
});

//POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        //const err = new Error('Wrong email or password.');
       req.flash('error', 'No account with that email exists.');
        //err.status = 401;
        return next();
      }  else {
        req.session.userId = user._id;
         res.locals.message = req.flash();
        return res.redirect('/todos');
      }
    });
  }
  else {
    const err = new Error('Email and password are required.');

    //req.flash('error', 'Email and password are required.');
    err.status = 401;
    // return res.redirect('/login');

    return next();
  }
});



router.post('/account/forgot', catchErrors(authController.forgot));


// GET /register
router.get('/register', mid.loggedOut, (req, res, next) => {
  return res.render('register', { title: 'Sign Up' });
});

// POST /register
router.post('/register', mid.loggedOut, function(req, res, next) {
  if (req.body.email &&
    req.body.name &&
    req.body.password &&
    req.body.confirmPassword
    ) {

      // confirm that user typed same password twice
      if (req.body.password !== req.body.confirmPassword) {
        const err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }

      // create object with form input
      const userData = {
        email: req.body.email,
        name: req.body.name,
        password: req.body.password
      };

      // use schema's `create` method to insert document into Mongo
      User.create(userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          return res.redirect('/todos');
        }
      });

    } else {
      const err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});


// GET request for list of all todo.
router.get('/todos',mid.requiresLogin, todoController.todoList);
router.get('/todo/create', mid.requiresLogin, todoController.todocreateget);
router.post('/todo/create', todoController.todoCreatePost);
// GET request for one Todo.
router.get('/todo/:id', todoController.todoDetail);
// GET request to delete todo.
router.get('/todo/:id/delete', todoController.todoDeleteGet);
// POST request to delete todo.
router.post('/todo/:id/delete', todoController.todoDeletePost);

// GET request to update Todo.
router.get('/todo/:id/update', todoController.todoUpdateGet);

// POST request to update Todo.
router.post('/todo/:id/update', todoController.todoUpdatePost);

module.exports = router;
