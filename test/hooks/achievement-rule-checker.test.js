const assert = require('chai').assert;
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
    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    const result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: '10XPAchievement'
      }
    });

    assert.deepEqual(result[0].current_amount, 1);
  });

  it('gives an achievement after other achievement', async () => {
    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    const result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'AchievementRequiringOtherAchievement'
      }
    });

    assert.deepEqual(result[0].current_amount, 1);
  });

  it('gives achievement requiring 2 Types of XP', async () => {
    await app.service('events').create({
      'name': 'EventGiving2XPTypes',
      'user_id': user_id
    });

    const result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'AchievementRequiring2XPTypes'
      }
    });

    assert.deepEqual(result[0].current_amount, 1);
  });

  it('gives achievement requiring event', async () => {
    await app.service('events').create({
      'name': 'EventGrantingAchievement',
      'user_id': user_id
    });

    const result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'AchievementRequiringEvent'
      }
    });

    assert.deepEqual(result[0].current_amount, 1);
  });

  it('gives AnyOf Achievement', async () => {
    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    const result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'AnyOfAchievement'
      }
    });

    assert.deepEqual(result[0].current_amount, 1);
  });


  it('replaces an achievement', async () => {
    const achievement_name = 'AchievementBeingReplaced';

    await app.service('events').create({
      'name': 'EventGrantingAchievement',
      'user_id': user_id
    });
    await app.service('events').create({
      'name': 'EventGrantingAchievement',
      'user_id': user_id
    });

    let result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: achievement_name
      }
    });

    assert.deepEqual(result[0].current_amount, 2);
    assert.deepEqual(result[0].total_amount, 2);

    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'AchievementReplacingOther'
      }
    });

    assert.deepEqual(result[0].current_amount, 1);
    assert.deepEqual(result[0].total_amount, 1);

    result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: achievement_name
      }
    });

    assert.lengthOf(result, 1);
    assert.deepInclude(result[0], {name: achievement_name, current_amount: 0, total_amount: 2});
  });


  it('gives achievement maxAwardedTotal times', async () => {
    const achievement_name = 'AchievementCanBeAwardedTwice';

    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    let result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: achievement_name
      }
    });

    assert.deepEqual(result[0].current_amount, 1);
    assert.deepEqual(result[0].total_amount, 1);

    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: achievement_name
      }
    });

    assert.deepEqual(result[0].current_amount, 2);
    assert.deepEqual(result[0].total_amount, 2);


    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: achievement_name
      }
    });

    assert.deepEqual(result[0].current_amount, 2);
    assert.deepEqual(result[0].total_amount, 2);
  });

  it('gives maxAwardedTotal achievements at once', async () => {
    const achievement_name = 'AchievementCanBeAwardedTwiceAtOnce';

    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    let result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: achievement_name
      }
    });

    assert.deepEqual(result[0].current_amount, 2);
    assert.deepEqual(result[0].total_amount, 2);

    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: achievement_name
      }
    });

    assert.deepEqual(result[0].current_amount, 2);
    assert.deepEqual(result[0].total_amount, 2);
  });

  it('gives chained achievements', async () => {
    await app.service('events').create({
      'name': 'EventGiving10XP',
      'user_id': user_id
    });

    let result1 = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: '10XPAchievement'
      }
    });
    assert.deepEqual(result1[0].current_amount, 1);

    let result2 = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: 'ChainedAchievement'
      }
    });
    assert.deepEqual(result2[0].current_amount, 1);
  });
});
