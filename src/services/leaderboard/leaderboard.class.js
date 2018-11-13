/* eslint-disable no-unused-vars */
class Service {
  /* istanbul ignore next */
  constructor(options) {
    this.options = options || {};
  }

  setup(app) {
    this.app = app;
  }

  /* methods ignored due to leaderboard-hooks, before > find > leaderboardActions from hooks/leaderboard-actions, as the method sets "context.result" */
  async find(params) {
   
    return [];
  }

  async get(id, params) {

    return null;
  }
}

module.exports = {
  createService: function (options) {
    return new Service(options);
  },
  service: Service
};
