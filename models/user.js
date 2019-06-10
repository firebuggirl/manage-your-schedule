// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); //password hashing function
// const validator = require('validator');//validate email
// const passportLocalMongoose = require('passport-local-mongoose');
// const mongoSanitize = require('express-mongo-sanitize');//added June 20th, test to see if working...
const Todo = require('./todo');
//const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');//bcrypt is better than md5 for security
const validator = require('validator');//validate email
const mongodbErrorHandler = require('mongoose-mongodb-errors');//prettify default MongoDb errors
const passportLocalMongoose = require('passport-local-mongoose');//add additional fields and methods to create new logins

//mongoose.Promise = global.Promise;


const UserSchema = new Schema({

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid Email Address'],
      required: 'Please Supply an email address'
    },
    name: {
      type: String,
      required: 'Please supply a name',
      trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

//new in MongoDB
// Add new field called reviews to schema
// find reviews where the users _id property === reviews user property
UserSchema.virtual('todos', {//virtual fields do NOT go into eith an object or into JSON UNLESS you explicityly ask it to...if want to change this....add default setting/object on line #40
  ref: 'Todo', // what model to link? ..ie., go to another model (Review) and do query on individual reviews that relate to the _id of each store in this model
  localField: '_id', // which field on the Store model needs to match up w/ which field on our Review model?
  foreignField: 'user' // which field on the review?
});//like a 'join' in MySQL

// display reviews on each store
function autopopulate(next) {
  this.populate('todos');
  next();
}

UserSchema.pre('find', autopopulate);
UserSchema.pre('findOne', autopopulate);



UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
UserSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', UserSchema);
