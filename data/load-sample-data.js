require('dotenv').config({ path: __dirname + '/../variables.env' });
const fs = require('fs');

const mongoose = require('mongoose');
mongoose.connect(process.env.LOCAL_DB);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

// import all of our models - they need to be imported only once
const Todo = require('../models/todo');
//const User = require('../models/user');



const todos = JSON.parse(fs.readFileSync(__dirname + '/newtodos.json', 'utf-8'));
//const users = JSON.parse(fs.readFileSync(__dirname + '/users.json', 'utf-8'));

async function deleteData() {
  console.log('😢😢 Goodbye Data...');
  await Todo.remove();
  //await User.remove();
  console.log('Data Deleted. To load sample data, run\n\n\t npm run sample\n\n');
  process.exit();
}

async function loadData() {
  try {
    await Todo.insertMany(todos);
    //await User.insertMany(users);


    console.log('👍👍👍👍👍👍👍👍 Done!');
    process.exit();
  } catch(e) {
    console.log('\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n');
    console.log(e);
    process.exit();
  }
}
if (process.argv.includes('--delete')) {
  deleteData();
} else {
  loadData();
}
