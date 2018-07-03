const achievement = require('./achievement/achievement.service.js');
const xp = require('./xp/xp.service.js');
const event = require('./event/event.service.js');
const user = require('./user/user.service.js');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(achievement);
  app.configure(xp);
  app.configure(event);
  app.configure(user);
};
