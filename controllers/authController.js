
require('dotenv').config({ path: __dirname + '/../variables.env' });
const passport = require('passport');//library to log in
//Handles all of the logging in, passport.js stuff, all password resets, and email sending
const crypto = require('crypto');//crypto is native in Node
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');


exports.login = passport.authenticate('local', {//middlewart that comes with passport
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/todos',
  successFlash: 'You are now logged in!'
});


exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out! 👋');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {//check w/ passport to see if user is logged in w/ creds
    next(); // carry on! They are logged in!
    return;
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // 1. See if a user with that email exists
  const user = await User.findOne({ email: req.body.email });//find user's email in DB
  if (!user) {
    req.flash('error', 'No account with that email exists.');
    //req.flash('error', 'A password reset has been mailed to you');//..even if user does not exist..if you have private site where you do not want people to be able to phish for existing users?
    return res.redirect('/login');
  }
  // 2. Set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');//crypto automatically included with Node.js...creates a random string
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();
  // 3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;//'req.headers.host' returns either localhost OR url in deployment
  await mail.send({
   user,
   filename: 'password-reset',
   subject: 'Password Reset',
   resetURL
   });
//  req.flash('success', `You have been emailed a password reset link. ${resetURL}`);//Don't EVER include ${resetURL} in live page, just here for testing....
  req.flash('success', `You have been emailed a password reset link.`);
  // 4. redirect to login page
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({//search user in DB
    resetPasswordToken: req.params.token,//Is there someone with this token?
    resetPasswordExpires: { $gt: Date.now() }//Is this token not yet expired? ie., check if key is greater than right now
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // if there is a user, show the rest password form
  res.render('reset', { title: 'Reset your Password' });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {//use square brackets when accessing a property on an object with a '-'
    next(); // keep it going!
    return;
  }
  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);//setPassword method is a callback, so turn it into a promise ...+ bind it to user
  await setPassword(req.body.password);//set new hashed/salted password
  user.resetPasswordToken = undefined;//get rid of token...in MongoDb, set value to undefined
  user.resetPasswordExpires = undefined;//get rid of expiration
  const updatedUser = await user.save();//save update to DB
  await req.login(updatedUser);//auto login method via passport.js
  req.flash('success', '💃 Nice! Your password has been reset! You are now logged in!');
  res.redirect('/');
};
