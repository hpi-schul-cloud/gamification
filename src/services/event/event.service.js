// Initializes the `Event` service on path `/events`
const createService = require('feathers-mongoose');
const createModel = require('../../models/event.model');
const hooks = require('./event.hooks');

module.exports = function (app) {
  const Model = createModel(app);

  const options = {
    Model
  };

  // Initialize our service with any options it requires
  app.use('/events', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('events');

  service.hooks(hooks);
};
