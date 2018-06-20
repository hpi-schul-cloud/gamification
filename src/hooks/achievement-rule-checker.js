// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const getNestedValue = require('../utils').getNestedValue;

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const rules = context.app.get('rules');
    const achievementRules = rules['achievements'];

    for (const achievementRule of achievementRules) {
      if (await achievementRule.canBeAwarded(context) && await achievementRule.isFulfilled(context)) {
        const scope = achievementRule.scope.reduce((scope, scopeFieldName) => {
          if (scopeFieldName !== 'user_id') {
            const nestedValue = getNestedValue(context.data.context, scopeFieldName);
            if (nestedValue === undefined) {
              throw new Error(`Received an event of type ${achievementRule.name} where ${scopeFieldName} was not set.`);
            }
            scope[scopeFieldName] = nestedValue;
          }
          return scope;
        }, {});

        const achievementService = context.app.service('achievements');
        const uniqueCombination = await achievementService.find({
          query: {
            user_id: context.data.user_id,
            name: achievementRule.name,
            scope: scope
          }
        });

        if (uniqueCombination.length > 0) {
          await achievementService.patch(uniqueCombination[0]._id, {
            amount: uniqueCombination[0].amount + 1
          });
        } else {
          await achievementService.create({
            user_id: context.data.user_id,
            name: achievementRule.name,
            amount: 1,
            scope: scope
          });
        }

        for (const replaceName of achievementRule.replaces) {
          const replacedAchievement = await achievementService.find({
            query: {
              user_id: context.data.user_id,
              name: replaceName
            }
          });

          /* istanbul ignore else */
          if (replacedAchievement.length !== 0) {
            await context.app.service('achievements').remove(replacedAchievement[0]._id);
          }
        }
      }
    }
    return context;
  };
};
