const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const services = require('../../src/services');

async function cleanDatabase(app) {
  await require('../../src/models/achievement.model.js')(app).remove({});
  await require('../../src/models/event.model.js')(app).remove({});
  await require('../../src/models/xp.model.js')(app).remove({});
}

describe('\'after-achievement-module\' hook', () => {
  let app;

  beforeEach(async () => {
    app = feathers();

    app.set('rules', require('../../src/rule-parser.js')(__dirname + '/../config/after-achievement-module-config.yml'));
    app.configure(configuration());
    app.configure(require('../../src/mongoose.js'));

    await cleanDatabase(app);
    app.configure(services);

  });

  it('gives XP afer an achievement', async () => {

    const eventName = 'EventGiving10XP';
    const user_id = 'TestUser'; 

    await app.service('events').create({
      'name': eventName,
      'user_id': user_id
    });

    const result = await app.service('xp').find({
      query: {
        user_id: user_id,
        name: 'achievementActionXP'
      }
    });

    assert.deepEqual(result[0].amount, 1);
  });
});
