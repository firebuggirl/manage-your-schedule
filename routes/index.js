const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mid = require('../middleware');

//const methodOverride = require('method-override');//use this Eventdleware to be able to conduct a put request on a form to update data
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const todoController = require('../controllers/todoController');

const { catchErrors } = require('../handlers/errorHandlers');
const flash = require('connect-flash');
require('dotenv').config({ path: '../variables.env' });


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


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/login', userController.loginForm);
router.post('/login', authController.login);
// GET /logout
router.get('/logout', authController.logout);

//router.post('/account/forgot', catchErrors(authController.forgot));


router.get('/register', userController.registerForm);

// POST /register
// 1. Validate the registration data
// 2. register the user
// 3. we need to log them in
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
);

// GET request for list of all todo.
router.get('/todos',authController.isLoggedIn, catchErrors(todoController.getTodos));
router.get('/todos/page/:page', authController.isLoggedIn, catchErrors(todoController.getTodos));
router.get('/todo/create', authController.isLoggedIn, catchErrors(todoController.todocreateget));
router.post('/todo/create',authController.isLoggedIn, catchErrors(todoController.addTodo));
//
// // GET request for one Todo.
router.get('/todo/:id', todoController.todoDetail);
// // GET request to delete todo.
router.get('/todo/:id/delete', catchErrors(todoController.todoDeleteGet));
// // POST request to delete todo.
router.post('/todo/:id/delete', todoController.todoDeletePost);
//
// // GET request to update Todo.
router.get('/todo/:id/update', catchErrors(todoController.editTodoGet));
//
// // POST request to update Todo.
router.post('/todo/:id/update', catchErrors(todoController.updateTodo));

module.exports = router;
