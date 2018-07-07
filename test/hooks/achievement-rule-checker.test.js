const feathers = require('@feathersjs/feathers');
const services = require('../../src/services');
const configuration = require('@feathersjs/configuration');
const utils = require('../test-utils');

async function cleanDatabase(app) {
  await require('../../src/models/achievement.model.js')(app).remove({});
  await require('../../src/models/event.model.js')(app).remove({});
  await require('../../src/models/xp.model.js')(app).remove({});
}

describe('\'achievement-rule-checker\' hook', () => {
  let app;
  const user_id = 'TestUser';

  beforeEach(async () => {
    app = feathers();

    app.set('rules', require('../../src/rule-parser')(__dirname + '/../config/achievement-rule-checker-config.yml'));
    app.configure(configuration());
    app.configure(require('../../src/mongoose.js'));

    await cleanDatabase(app);
    app.configure(services);

  });

  it('gives achievement after 10 XP', async () => {
    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, '10XPAchievement', 1);
  });

  it('gives an achievement after other achievement', async () => {
    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, 'AchievementRequiringOtherAchievement', 1);
  });

  it('gives achievement requiring 2 Types of XP', async () => {
    await utils.createEvent(app, user_id, 'EventGiving2XPTypes');

    await utils.assertAchievement(app, user_id, 'AchievementRequiring2XPTypes', 1);
  });

  it('gives achievement requiring event', async () => {
    await utils.createEvent(app, user_id, 'EventGrantingAchievement');

    await utils.assertAchievement(app, user_id, 'AchievementRequiringEvent', 1);
  });

  it('gives AnyOf Achievement', async () => {
    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, 'AnyOfAchievement', 1);
  });

  it('gives AnyOf Conditions Achievement', async () => {
    await app.service('events').create({
      'name': 'ParameterEvent',
      'user_id': user_id,
      'payload': {'x': 1, 'y': 3}
    });

    const result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'AnyOfConditionsAchievement'
      }
    });

    assert.deepEqual(result[0].amount, 1);
  });


  describe.skip('replaces achievement', async () => {
    const achievement_name = 'AchievementBeingReplaced';

    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, achievement_name, 1);

    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, 'AchievementReplacingOther', 1);
    await utils.assertAchievement(app, user_id, achievement_name, 0);
  });

  it('gives achievement maxAwarded times', async () => {
    const achievement_name = 'AchievementCanBeAwardedTwice';

    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, achievement_name, 1);

    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, achievement_name, 2);

    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, achievement_name, 2);
  });

  it('gives maxAwarded achievements at once', async () => {
    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, 'AchievementCanBeAwardedTwiceAtOnce', 2);

    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, 'AchievementCanBeAwardedTwiceAtOnce', 2);
  });

  it('gives chained achievements', async () => {
    await utils.createEvent(app, user_id, 'EventGiving10XP');

    await utils.assertAchievement(app, user_id, '10XPAchievement', 1);
    await utils.assertAchievement(app, user_id, 'ChainedAchievement', 1);
  });

  it('Gives achievement with logical amount >', async () => {
    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    let moreResult1 = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'MoreAchievement'
      }
    });
    assert.deepEqual(moreResult1.length, 0);

    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    let moreResult2 = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'MoreAchievement'
      }
    });
    assert.deepEqual(moreResult2[0].amount, 1);
  });

  it('Gives achievement with logical amount ==', async () => {
    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    let result1 = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'EqualAchievementFailing'
      }
    });
    assert.deepEqual(result1.length, 0);

    let result2 = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'EqualAchievementSucceeding'
      }
    });
    assert.deepEqual(result2[0].amount, 1);
  });

  it('Gives achievement with logical amount !=', async () => {
    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    let result1 = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'NotEqualAchievement'
      }
    });
    assert.deepEqual(result1.length, 0);

    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    let result2 = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'NotEqualAchievement'
      }
    });
    assert.deepEqual(result2[0].amount, 1);
  });

  it('Gives achievement with logical amount </<=', async () => {
    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    let result1 = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'LessAchievement'
      }
    });
    assert.deepEqual(result1.length, 0);

    let result2 = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'UnderAchieverAchievement'
      }
    });
    assert.deepEqual(result2.length, 1);
  });
});
