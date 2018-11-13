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

    const x = (await this.app.service('leaderboard').Model);

    x.aggregate(
      [
        {
          $group: {
            _id: "$user_id", 
            totalPerUser: {
              $sum: "$amount"
            }
          }
        }, {
          $lookup: {
            from: 'achievements', 
            localField: '_id', 
            foreignField: 'user_id', 
            as: 'achievements'
          }
        }
      ]
  , function (err, result) {
      if (err) {
          console.log(err);
          return;
      }
      console.log(result);
});

    return [];
  }

  async get(id, params) {

    // const achievements = (await this.app.service('achievements').find({
    //   query: {
    //     user_id: id
    //   }
    // })).filter(achievement => {
    //   const achievementRule = rules['achievements'].find(rule => {
    //     return rule.name === achievement.name;
    //   });
    //   return achievement.current_amount > 0 && achievementRule.hidden === false;
    // }).map(achievement => {
    //   return {
    //     name: achievement.name,
    //     amount: achievement.current_amount,
    //     scope: achievement.scope,
    //     meta: achievement.meta
    //   };
    // });

   

    return {
      user_id: -1,
      achievements: [],
      xp: -1,
      level: 0,
      value: 0
    };
  }
}

module.exports = {
  createService: function (options) {
    return new Service(options);
  },
  service: Service
};
