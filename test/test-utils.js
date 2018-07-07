const assert = require('assert');

module.exports = {
  async createEvent(app, user_id, event_name) {
    await app.service('events').create({
      'name': event_name,
      'user_id': user_id
    });
  },

  async assertAchievement(app, user_id, achievement_name, amount) {
    const result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: achievement_name
      }
    });

    if (amount === 0) {
      assert.deepEqual(result.length === 0);
    } else {
      assert.deepEqual(result[0].amount, amount);
    }
  },

  async assertXP(app, user_id, xp_name, amount) {
    const result = await app.service('xp').find({
      query: {
        user_id: user_id,
        name: xp_name
      }
    });

    assert.deepEqual(result[0].amount, amount);
  }
};
