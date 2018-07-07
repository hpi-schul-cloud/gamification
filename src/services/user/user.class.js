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
      return rules['achievements'].find(rule => {
        return rule.name === achievement.name;
      }).hidden == false;
    }).map(achievement => {
      return {
        name: achievement.name,
        amount: achievement.amount,
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

    let level = 1;

    if(xp && xp.length) {
      const values = rules['levels']['values'];
      const levelXP = xp.find(x => x['name'] === 'XP')['amount'];
      let initialValue = values[0];
      let value = initialValue;

      switch(rules['levels']['type']) {
        case 'manual':
          for (let value of values) {
            if (levelXP >= value) {
              level += 1;
            }
          }
          break;
        case 'linear':
          while (levelXP >= value) {
            level += 1;
            value += initialValue;
          }
          break;
        case 'exponential':
          while (levelXP >= value) {
            level += 1;
            value *= initialValue;
          }
          break;
        default:
          throw new Error('Levels Type should be one of "manual", "linear" or "exponential"');
      }
    }

    return {
      user_id: id,
      achievements: achievements,
      xp: xp,
      level: level
    };
  }
}

module.exports = {
  createService: function (options) {
    return new Service(options);
  },
  service: Service
};
