const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;


const mongoose = require('mongoose');


//require('./app/models/applause');
require('./models/user');
require('./models/todo');

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major <= 7 && minor <= 5) {
  console.log('🛑 🌮 🐶 💪 💩\nHey You! \n\t ya you! \n\t\tBuster! \n\tYou\'re on an older version of node that doesn\'t support the latest and greatest things we are learning (Async + Await)! Please go to nodejs.org and download version 7.6 or greater. 👌\n ');
  process.exit();
}

mongoose.connect(process.env.LOCAL_DB);
//mongoose.connect(process.env.DATABASE || process.env.LOCAL_DB);

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});




// Start our app!
const app = require('./app');

// Constants for Docker
//  const PORT = 3000;
// const HOST = '0.0.0.0';//Docker host
//
//
 // app.listen(PORT, HOST);
 // console.log(`Running on http://${HOST}:${PORT}`);

const port = process.env.PORT || 3000;

app.set('port', process.env.PORT || 3000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
