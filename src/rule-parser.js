const yaml = require('js-yaml');
const fs   = require('fs');

class AchievementRule {
  constructor(rule, name) {
    this.name = name;
    this.requirements = new Requirements(rule['requirements'] === undefined ? [] : rule['requirements']);
    this.replaces = rule['replaces'] === undefined ? [] : rule['replaces'] ;
    this.maxAwarded = rule['maxAwarded'] === undefined ? 1 : rule['maxAwarded'];
    this.scope = rule['scope'] === undefined ? ['user_id'] : rule['scope'];
    this.actions = rule['actions'] === undefined ? [] : rule['actions'];
    this.hidden = rule['hidden'] === undefined ? false : rule['hidden'];
  }

  async isFulfilled(context) {
    return this.requirements.isFulfilled(context);
  }
}

class Requirements {
  constructor(requirements) {
    requirements = requirements.map((requirement) => {
      requirement['amount'] = requirement['amount'] === undefined ? 1 : requirement['amount'];
      return requirement;
    });
    this.achievementRequirements = requirements.filter((requirement) => requirement['achievement'] !== undefined);
    this.xpRequirements = requirements.filter((requirement) => requirement['xp'] !== undefined);
    this.eventRequirements = requirements.filter((requirement) => requirement['event'] !== undefined);
  }

  async isFulfilled(context) {
    for (const achievementRequirement of this.achievementRequirements) {
      const matches = await context.app.service('achievements').find({query: {
        user_id: context.data.user_id,
        name: achievementRequirement['achievement']
      }});
      if (matches.length === 0) return false;
      if (!Requirements.isValidAmount(matches[0].amount, achievementRequirement['amount'])) return false;
    }

    for (const xpRequirement of this.xpRequirements) {
      const matches = await context.app.service('xp').find({query: {
        user_id: context.data.user_id,
        name: xpRequirement['xp']
      }});
      if (matches.length === 0) return false;
      if (!Requirements.isValidAmount(matches[0].amount, xpRequirement['amount'])) return false;
    }
    // events
    return true;
  }

  static isValidAmount(actualAmount, amountCondition) {
    amountCondition = Number.isInteger(amountCondition) ? `>= ${amountCondition}` : amountCondition;
    amountCondition = amountCondition.trim();
    const operator = amountCondition.split(/\s+/)[0];
    const number = parseInt(amountCondition.split(/\s+/)[1]);

    switch(operator) {
    case '==':
      return actualAmount === number;
    case '>':
      return actualAmount > number;
    case '<':
      return actualAmount < number;
    case '>=':
      return actualAmount >= number;
    case '<=':
      return actualAmount <= number;
    case '!=':
      return actualAmount !== number;
    default:
      console.error(`Unexpected operator : ${operator}`);
    }
  }
}

try {
  var rules = yaml.safeLoad(fs.readFileSync('./config/gamification.yml', 'utf8'));
} catch (e) {
  console.error(e);
}


const achievementRules = [];

for (const achievementName of Object.keys(rules['achievements'])) {
  const rule = new AchievementRule(rules['achievements'][achievementName], achievementName);
  achievementRules.push(rule);
}

rules['achievements'] = achievementRules;

// TODO perhaps add conditions, events etc for requirements


module.exports = rules;
