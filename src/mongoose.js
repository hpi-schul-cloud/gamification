const mongoose = require('mongoose');

module.exports = function (app) {
  mongoose.connect(process.env.MONGO_URL, {});
  mongoose.Promise = global.Promise;

  app.set('mongooseClient', mongoose);
};
