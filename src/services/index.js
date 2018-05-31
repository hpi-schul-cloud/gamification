const achievement = require('./achievement/achievement.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(achievement);
};
