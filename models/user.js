var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); //password hashing function
const validator = require('validator');//validate email
const passportLocalMongoose = require('passport-local-mongoose');
const mongoSanitize = require('express-mongo-sanitize');//added June 20th, test to see if working...
mongoose.Promise = global.Promise;


var UserSchema = new mongoose.Schema({
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
  //   favoriteBook: {
  //     type: String,
  //     required: true,
  //     trim: true
  //   },
  //   favoriteBand: {
  //     type: String,
  //     required: true,
  //     trim: true
  //   },
  //   favoriteFood: {
  //     type: String,
  //     required: true,
  //     trim: true
  //   },
  //   text: {
  //     type: String
  //   //  ref: 'User'
  // },
  // start:{
  //   type: Date
  // },
    password: {
      type: String,
      required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  //   data: {
  //   oauth: { type: String, required: true }
  // }
    // newFavoriteBook: {
    //      type: String,
    //      required: true,
    //      trim: true
    //    }
});



mongoSanitize.sanitize(UserSchema); //added Tues, June 20th...check to see if working

mongoSanitize.sanitize(UserSchema, { //added Tues, June 20th...check to see if working
  replaceWith: '_'
});

// authenticate input against database documents
UserSchema.statics.authenticate = function(email, password, callback) {
  User.findOne({ email: email })
      .exec(function (error, user) {
        if (error) {
          return callback(error);
        } else if ( !user ) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password , function(error, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        });
      });
};
// hash password before saving to database
UserSchema.pre('save', function(next) {
  var user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});
var User = mongoose.model('User', UserSchema);//model method creates schema
module.exports = User;

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// var UserSchema2 = new mongoose.Schema({
//
//     newFavoriteBook: {
//       type: String,
//       required: true,
//       trim: true
//     }
// });
// //
//  var UserUpdate = mongoose.model('UserUpdate', UserSchema2);
//  module.exports = UserUpdate;


//Note:
//was able to update favoriteBook in shell:
// db.users.update({_id:ObjectId("5898e0659946de61e3e3e698")},{$set:{favoriteBook:"Rolling Stones Biography"}})
