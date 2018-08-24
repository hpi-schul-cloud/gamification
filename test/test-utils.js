const assert = require('assert');

module.exports = {
  async createEvent(app, user_id, event_name, payload = {}) {
    await app.service('events').create({
      'name': event_name,
      'user_id': user_id,
      'payload': payload
    });
  },

  async createEventWithPayload(app, user_id, event_name, payload) {
    await app.service('events').create({
      'name': event_name,
      'user_id': user_id,
      'payload': payload
    });
  },

  async assertAchievement(app, user_id, achievement_name, currentAmount, totalAmount) {
    if (totalAmount === undefined) {
      totalAmount = currentAmount;
    }

    const result = await app.service('achievements').find({
      query: {
        user_id: user_id,
        name: achievement_name
      }
    });

    if (currentAmount === 0 && totalAmount === 0 && result.length === 0) {
      return;
    }

    assert.deepEqual(result[0].current_amount, currentAmount);
    assert.deepEqual(result[0].total_amount, totalAmount);
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
