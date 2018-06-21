// Initializes the `amqp-connector` service on path `/amqp-connector`
const createService = require('./amqp-connector.class.js');
const hooks = require('./amqp-connector.hooks');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/amqp-connector', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('amqp-connector');

  service.hooks(hooks);
};
