const express = require('express');
const router = express.Router();
const passport = require('passport');
passport.initialize();



function loggedOut(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/profile');
  }
  return next();
}

function loggedOutFb(req, res, next) {
  if (req.session) {
    return res.redirect('/profile');
  }
  return next();
}
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    // const err = new Error('You must be logged in to view this page.');
    // err.status = 401;
    // return next(err);
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
}

function loggedInFb(req, res, next){
  if (req.session && req.user ) {

    return next();
  } else {
    const err = new Error('You must be logged in to Facebook to view this page.');
    err.status = 401;
    return next(err);
  }
}
function isLoggedIn(req, res, next){
  if (req.session && req.session.userId) {
    return next();
  } else {
    //const err = new Error('You must be logged in to view this page.');
    req.flash('error', 'You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}
module.exports.loggedOut = loggedOut;//needs to be requried in the routes/index.js file, which is (routes/index) included in app.js on line 44

module.exports.requiresLogin = requiresLogin;//can now password protect any route in the application by adding this middleware into any routes function

module.exports.loggedInFb = loggedInFb;
