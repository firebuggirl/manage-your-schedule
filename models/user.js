const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); //password hashing function
const validator = require('validator');//validate email
const passportLocalMongoose = require('passport-local-mongoose');
const mongoSanitize = require('express-mongo-sanitize');//added June 20th, test to see if working...
mongoose.Promise = global.Promise;


const UserSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      validate: [validator.isEmail, 'Invalid Email Address'],
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});



mongoSanitize.sanitize(UserSchema); //added Tues, June 20th...check to see if working

mongoSanitize.sanitize(UserSchema, { //added Tues, June 20th...check to see if working
  replaceWith: '_'
});

// authenticate input against database documents
UserSchema.statics.authenticate = (email, password, callback) => {
  User.findOne({ email: email })
      .exec((error, user) => {
        if (error) {
          return callback(error);
        } else if ( !user ) {
          const err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password , (error, result) => {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        });
      });
};
// hash password before saving to database
UserSchema.pre('save', function(next) {//arrow function causes 500 server error here...don't use
  const user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});
const User = mongoose.model('User', UserSchema);//model method creates schema
module.exports = User;

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
