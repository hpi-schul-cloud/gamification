const achievement = require('./achievement/achievement.service.js');
const xp = require('./xp/xp.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(achievement);
  app.configure(xp);
};
