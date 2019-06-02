const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;


const TodoSchema = new mongoose.Schema({
    name: {type: String, required: true, min: 3, max: 100, unique: true},
    details: { type: String, min: 3, Max: 200},
    todoId: { type: mongoose.Schema.ObjectId,  ref: 'User' },
});

// Virtual for this todo instance URL.
TodoSchema
.virtual('url')
.get(() => {
  //return '/catalog/todo/'+this._id;
    return '/todo/'+this._id;
});

// Export model.
module.exports = mongoose.model('Todo', TodoSchema);
