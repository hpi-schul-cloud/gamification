// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const rules = require("./../judge.js")

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {

    const eventRule = rules["events"][context.data.name];

    if (eventRule) {
      const eventActions = eventRule["actions"];

      for (var action of eventActions) {
        //post to xp
        var appFromContext = context.app;
        const xpService = appFromContext.service('xp');
        xpService.create({user_id: context.data.user_id, name: action["xp"],amount: action["amount"]});
      }
    }


    return context;
  };
};
