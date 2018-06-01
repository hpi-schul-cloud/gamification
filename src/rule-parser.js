const yaml = require('js-yaml');
const fs   = require('fs');


try {
  var rules = yaml.safeLoad(fs.readFileSync('./config/gamification.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

const achievementRules = [];

for (const achievementName of rules['achievements']) {
  const rule = new AchievementRule(rules['achievements'][achievementName]);
  achievementRules.push(rule);
}

rules['achievements'] = achievementRules;

// TODO perhaps add conditions, events etc for requirements
class AchievementRule {
  constructor(rule) {
    this.requirements = rule['requirements'] === undefined ? [] : rule['requirements'];
    this.replaces = rule['replaces'] === undefined ? [] : rule['replaces'] ;
    this.maxAwarded = rule['maxAwarded'] === undefined ? 1 : rule['maxAwarded'];
    this.scope = rule['scope'] === undefined ? ['user_id'] : rule['scope'];
    this.actions = rule['actions'] === undefined ? [] : rule['actions'];
    this.hidden = rule['hidden'] === undefined ? false : rule['hidden'];
  }
}

module.exports = rules;
