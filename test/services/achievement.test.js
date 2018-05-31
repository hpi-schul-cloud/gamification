const assert = require('assert');
const app = require('../../src/app');

describe('\'Achievement\' service', () => {
  it('registered the service', () => {
    const service = app.service('achievements');

    assert.ok(service, 'Registered the service');
  });
});
