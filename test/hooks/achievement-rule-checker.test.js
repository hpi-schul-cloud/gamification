const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const achievementRuleChecker = require('../../src/hooks/achievement-rule-checker');

describe('\'achievement-rule-checker\' hook', () => {
  let app;

  beforeEach(() => {
    app = feathers();

    app.use('/dummy', {
      async get(id) {
        return { id };
      }
    });

    app.service('dummy').hooks({
      after: achievementRuleChecker()
    });
  });

  it('runs the hook', async () => {
    const result = await app.service('dummy').get('test');
    
    assert.deepEqual(result, { id: 'test' });
  });
});
