// Initializes the `XP` service on path `/xp`
const createService = require('feathers-mongoose');
const createModel = require('../../models/xp.model');
const hooks = require('./xp.hooks');

module.exports = function (app) {
  const Model = createModel(app);

  const options = {
    Model: Model,
  };

  // Initialize our service with any options it requires
  app.use('/xp', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('xp');

  service.hooks(hooks);
};
