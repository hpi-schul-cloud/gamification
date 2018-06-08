// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const rules = require('../rule-parser.js');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const achievementRule = rules['achievements'].find( rule => rule.name === context.data.name);

    if (achievementRule) {
      const achievementActions = achievementRule.actions;

      for (const action of achievementActions) {
        const appFromContext = context.app;
        const xpService = appFromContext.service('xp');
        const uniqueCombination = await xpService.find({
          query: {
            user_id: context.data.user_id,
            name: action['xp']
          }
        });

        if (uniqueCombination.length > 0) {
          xpService.patch(uniqueCombination[0]._id, {amount: uniqueCombination[0].amount + action['amount']});
        } else {
          xpService.create({user_id: context.data.user_id, name: action['xp'], amount: action['amount']});
        }
      }
    }

    return context;
  };
};
