// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const rules = context.app.get('rules');
    const achievementRules = rules['achievements'];
    // TODO scope

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
          await achievementService.patch(uniqueCombination[0]._id, {amount: uniqueCombination[0].amount + 1});
        } else {
          await achievementService.create({user_id: context.data.user_id, name: achievementRule.name, amount: 1});
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
