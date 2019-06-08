const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); //password hashing function
const validator = require('validator');//validate email
const passportLocalMongoose = require('passport-local-mongoose');
const mongoSanitize = require('express-mongo-sanitize');//added June 20th, test to see if working...
const Todo = require('./todo');
const jwt = require('jsonwebtoken');

mongoose.Promise = global.Promise;


const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      validate: [validator.isEmail, 'Invalid Email Address'],
      trim: true
    },
    password: {
      type: String,
      //minlength: 7,
      required: true,
      validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }

    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.virtual('todos', {
    ref: 'Todo',
    localField: '_id',
    foreignField: 'todoId'
});

// Delete user tasks when user is removed
UserSchema.pre('remove', async function (next) {
    const user = this
    await Todo.deleteMany({ todoId: user._id })
    next()
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
          const err = new Error('User not found.');
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
  const user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

UserSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}
const User = mongoose.model('User', UserSchema);//model method creates schema
module.exports = User;

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
