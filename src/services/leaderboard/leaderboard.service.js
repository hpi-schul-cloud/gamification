// Initializes the `Leaderboard` service on path `/leaderboard`
//const createService = require('./leaderboard.class.js')['createService'];
const hooks = require('./leaderboard.hooks');

const createService = require('feathers-mongoose');
const createModel = require('../../models/leaderboard.model');


module.exports = function (app) {

  const Model = createModel(app);

  const options = {Model};

  var resourcePath = '/leaderboard';

  // Initialize our service with any options it requires
  app.use('/leaderboard', createService(options));

  //// Get our initialized service so that we can register hooks
  const service = app.service('leaderboard');

  service.hooks(hooks);
};


