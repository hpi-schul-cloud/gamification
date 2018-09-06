const path = require('path');
const configuration = require('@feathersjs/configuration');
const feathers = require('@feathersjs/feathers');
const services = require('../../src/services');
const utils = require('../test-utils');

async function cleanDatabase(app) {
  await require('../../src/models/achievement.model.js')(app).remove({});
  await require('../../src/models/event.model.js')(app).remove({});
  await require('../../src/models/xp.model.js')(app).remove({});
}

describe('\'xp rule checker\' hook', () => {
  let app;
  const user_id = 'TestUser';

  beforeEach(async () => {
    app = feathers();

    app.set('rules', require('../../src/rule-parser')(path.join(__dirname, '..', 'config', 'xp-rule-checker-config.yml')));
    app.configure(configuration());
    app.configure(require('../../src/mongoose.js'));

    await cleanDatabase(app);
    app.configure(services);

  });

  it('gives standard XP after an event', async () => {
    const eventName = 'EventGiving10XP';

    await utils.createEvent(app, user_id, eventName);

    await utils.assertXP(app, user_id, 'XP', 10);
  });

  it('gives non standard XP after an event', async () => {
    const eventName = 'EventGiving25NonStandardXP';

    await utils.createEvent(app, user_id, eventName);

    await utils.assertXP(app, user_id, 'nonStandardXP', 25);
  });

  it('gives non standard XP after an event', async () => {
    const eventName = 'EventGivingMultipleKindsOfXP';

    await utils.createEvent(app, user_id, eventName);

    await utils.assertXP(app, user_id, 'XP', 20);
    await utils.assertXP(app, user_id, 'nonStandardXP', 30);
  });

  it('updates XP after an event', async () => {
    const eventName = 'EventGiving10XP';

    await utils.createEvent(app, user_id, eventName);
    await utils.createEvent(app, user_id, eventName);

    await utils.assertXP(app, user_id, 'XP', 20);
  });

  it('gives XP to the awardee if specified', async () => {
    const eventName = 'EventGiving10XPForPoster';
    const poster_id = 'PosterId';

    await utils.createEvent(app, user_id, eventName, {poster_id: poster_id});

    await utils.assertXP(app, poster_id, 'XP', 10);
  });
});
