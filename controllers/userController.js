const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

// exports.loginForm = (req, res) => {
//   res.render('login', { title: 'Login' });
// };

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Sign Up' });
};

//body = things posted via a form
//params = things that come via the url
//query = things that come from in the url, but after the ? mark
exports.validateRegister = (req, res, next) => {//if someone sends data to a url can check the body, you can check the params and you can check the query
  req.sanitizeBody('name');//sanitize name with sanitizeBody...one of the methods available from 'express-validator' required and "used" in app.js
  req.checkBody('name', 'You must supply a name!').notEmpty();//checkBody to see if name is provided
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({//allows for different email formats by normalizing them all down to a simple format
    //remove_dots: false,
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  req.checkBody('confirmPassword', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('confirmPassword', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });//send req.body back to the user so that if there is a form error all of the filled out fields are NOT deleted..prevents having to re-fill entire form
    return; // stop the fn from running
  }
  next(); // there were no errors!
};


exports.register = async (req, res, next) => {
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
      User.create(userData, (error, user) => {
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
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(//query for specific user in database + update
    { _id: req.user._id },//query
    { $set: updates },//update
    { new: true, runValidators: true, context: 'query' }//context is required to MongoDb to do query properly
  );
  //res.json(user);
  req.flash('success', 'Updated the profile!');
  res.redirect('back');//redirect back to url from where user came from
};
