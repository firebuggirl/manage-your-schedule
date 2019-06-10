const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

//configure passport
//methods provided by passportLocalMongoose plugin included in User.js
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//import this file in app.js!!!!
