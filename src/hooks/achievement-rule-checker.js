// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const rules = require('../rule-parser.js');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const achievementRules = rules['achievements'];

    for (const achievementRule of achievementRules) {
      if (achievementRule.isFulfilled(context))
    }

    return context;
  };
};
