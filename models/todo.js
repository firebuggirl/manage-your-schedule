const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// const Schema = mongoose.Schema;


const TodoSchema = new mongoose.Schema(
   {
    created: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', //User model
      required: 'You must supply an author!'
    },
    name: {
      type: String,
      required: 'Your todo must have text!',
      min: 3,
      max: 100
    },
    details: {
      type: String,
      min: 3,
      Max: 200
    }
    // todoId: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'User'
    // }
});

function autopopulate(next) { //make sure that when review is queried it's going to automatically so we don't have to explicitly ask for it
  this.populate('author');
  next();
}

//add hooks to autopopulate author field anytime find or findOne used
TodoSchema.pre('find', autopopulate);
TodoSchema.pre('findOne', autopopulate);
// Virtual for this todo instance URL.
TodoSchema
.virtual('url')
.get(function () {
  //return '/catalog/todo/'+this._id;
    return '/todo/'+this._id;
});

// Export model.
module.exports = mongoose.model('Todo', TodoSchema);
