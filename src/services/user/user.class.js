/* eslint-disable no-unused-vars */
class Service {
  /* istanbul ignore next */
  constructor(options) {
    this.options = options || {};
  }

  setup(app) {
    this.app = app;
  }

  /* istanbul ignore next */
  async find(params) {
    return [];
  }

  async get(id, params) {
    const rules = this.app.get('rules');
    const achievements = (await this.app.service('achievements').find({
      query: {
        user_id: id
      }
    })).filter(achievement => {
      const achievementRule = rules['achievements'].find(rule => {
        return rule.name === achievement.name;
      });
      return achievement.current_amount > 0 && achievementRule.hidden === false;
    }).map(achievement => {
      return {
        name: achievement.name,
        amount: achievement.current_amount,
        scope: achievement.scope
      };
    });

    const xp = (await this.app.service('xp').find({
      query: {
        user_id: id
      }
    })).map(xp => {
      return {
        name: xp.name,
        amount: xp.amount
      };
    });

    return {
      user_id: id,
      achievements: achievements,
      xp: xp,
      level: 42 // TODO
    };
  }
}

module.exports = {
  createService: function (options) {
    return new Service(options);
  },
  service: Service
};
