// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const rules = require('../rule-parser.js');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const achievementRules = rules['achievements'];
    // TODO max awarded + scope

    for (const achievementRule of achievementRules) {
      if (await achievementRule.canBeAwarded(context) && await achievementRule.isFulfilled(context)) {
        const achievementService = context.app.service('achievements');
        const uniqueCombination = await achievementService.find({
          query: {
            user_id: context.data.user_id,
            name: achievementRule.name
          }
        });

        if (uniqueCombination.length > 0) {
          achievementService.patch(uniqueCombination[0]._id, {amount: uniqueCombination[0].amount + 1});
        } else {
          achievementService.create({user_id: context.data.user_id, name: achievementRule.name, amount: 1});
        }
      }
    }

    return context;
  };
};
