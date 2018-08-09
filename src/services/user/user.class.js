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

    let level = 1;

    if(xp.length) {
      const currentXP = xp.find(x => x['name'] === 'XP')['amount'];
      let value = 0;

      switch(rules['levels']['type']) {
        case 'manual':
          for (const step of rules['levels']['steps']) {
            if (currentXP >= step) {
              level += 1;
            }
          }
          break;
        case 'linear':
          value = rules['levels']['interval'];
          while (currentXP >= value) {
            level += 1;
            value += rules['levels']['interval'];
          }
          break;
        case 'exponential':
          value = rules['levels']['starting_value'];
          while (currentXP >= value) {
            level += 1;
            value += ((level - 1) * rules['levels']['starting_value']);
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
