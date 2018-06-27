const assert = require('assert');
const app = require('../../src/app');

describe('\'amqp-connector\' service', () => {
  it('registered the service', () => {
    const service = app.service('amqp-connector');

    assert.ok(service, 'Registered the service');
  });
});
