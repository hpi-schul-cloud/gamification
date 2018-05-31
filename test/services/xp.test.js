const assert = require('assert');
const app = require('../../src/app');

describe('\'XP\' service', () => {
  it('registered the service', () => {
    const service = app.service('xp');

    assert.ok(service, 'Registered the service');
  });
});
