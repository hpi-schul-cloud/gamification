// Initializes the `User` service on path `/user`
const createService = require('./user.class.js');
const hooks = require('./user.hooks');

module.exports = function (app) {
  const options = {};

  // Initialize our service with any options it requires
  app.use('/user', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('user');

  service.hooks(hooks);
};
