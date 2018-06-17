const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const services = require('../../src/services');
const configuration = require('@feathersjs/configuration');

async function cleanDatabase(app) {
  await require('../../src/models/achievement.model.js')(app).remove({});
  await require('../../src/models/event.model.js')(app).remove({});
  await require('../../src/models/xp.model.js')(app).remove({});
}

describe('\'achievement-rule-checker\' hook', () => {
  let app;

  beforeEach(async () => {
    app = feathers();

    app.set('rules', require('../../src/rule-parser')(__dirname + '/../achievement-rule-checker-config.yml'));
    app.configure(configuration());
    app.configure(require('../../src/mongoose.js'));

    await cleanDatabase(app);
    app.configure(services);

  });

  it('gives achievement after 10 XP', async () => {

    const user_id = 'TestUser';

    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id,
    });

    const result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: '10XPAchievement'
      }
    });

    assert.deepEqual(result[0].amount, 1);
  });
});
