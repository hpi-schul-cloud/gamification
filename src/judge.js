const yaml = require('js-yaml');
const fs   = require('fs');


try {
  var rules = yaml.safeLoad(fs.readFileSync('./../congig/gamification.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

// parse the rules here

module.exports = function() {
  return rules;
  }
