const yaml = require('js-yaml');
const fs   = require('fs');

class AchievementRule {
  constructor(rule, name) {
    this.name = name;
    const requirements = rule['requirements'] === undefined ? [] : rule['requirements'];
    this.requirements = requirements.map(requirement => Requirement.fromYamlRequirement(requirement));
    this.replaces = rule['replaces'] === undefined ? [] : rule['replaces'] ;
    this.maxAwarded = rule['maxAwarded'] === undefined ? 1 : rule['maxAwarded'];
    this.scope = rule['scope'] === undefined ? ['user_id'] : rule['scope'];
    this.actions = rule['actions'] === undefined ? [] : rule['actions'];
    this.hidden = rule['hidden'] === undefined ? false : rule['hidden'];
  }

  async isFulfilled(context, isFirstCycle) {
    for (const requirement of this.requirements) {
      if (!await requirement.isFulfilled(context, isFirstCycle)) {
        return false;
      }
    }
    return true;
  }

  async canBeAwarded(context) {
    const achievementService = context.app.service('achievements');
    const awardedSoFar = await achievementService.find({
      query: {
        user_id: context.data.user_id,
        name: this.name
      }
    });
    const amountSoFar = awardedSoFar.length === 0 ? 0 : awardedSoFar[0].amount;
    return amountSoFar < this.maxAwarded;
  }
}

class Requirement {
  constructor(requirement) {
    this.requirement = requirement;
  }

  static fromYamlRequirement(requirement) {
    if (requirement['achievement'] !== undefined) {
      return new AchievementRequirement(requirement['achievement']);
    }
    if (requirement['xp'] !== undefined) {
      return new XPRequirement(requirement);
    }
    if (requirement['event'] !== undefined) {
      return new EventRequirement(requirement['event']);
    }
    if (requirement['AnyOf'] !== undefined) {
      return new AnyOfRequirement(requirement['AnyOf']);
    }
    throw new Error('Invalid requirement: Either achievement, xp or event needs to be set: ' + JSON.stringify(requirement));
  }

  // eslint-disable-next-line no-unused-vars
  async isFulfilled(context) {
    throw new Error('This method needs to be implemented in my subclasses.');
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
        throw new Error(`Unexpected operator : ${operator}`);
    }
  }
}

class XPRequirement extends Requirement {
  constructor(requirement) {
    requirement['amount'] = requirement['amount'] === undefined ? 1 : requirement['amount'];
    super(requirement);
  }

  async isFulfilled(context) {
    const matches = await context.app.service('xp').find({
      query: {
        user_id: context.data.user_id,
        name: this.requirement['xp']
      }
    });
    if (matches.length === 0) return false;
    if (matches.length > 1) throw new Error('Found more than one match, this should be impossible');
    if (!Requirement.isValidAmount(matches[0].amount, this.requirement['amount'])) return false;

    return true;
  }
}

class AchievementRequirement extends Requirement {
  constructor(requirement) {
    requirement['amount'] = requirement['amount'] === undefined ? 1 : requirement['amount'];
    super(requirement);
  }

  async isFulfilled(context) {
    const matches = await context.app.service('achievements').find({
      query: {
        user_id: context.data.user_id,
        name: this.requirement['name']
      }
    });
    if (matches.length === 0) return false;
    if (matches.length > 1) throw new Error('Found more than one match, this should be impossible');
    if (!Requirement.isValidAmount(matches[0].amount, this.requirement['amount'])) return false;

    return true;
  }
}

class EventRequirement extends  Requirement {

  constructor(requirement) {
    requirement['amount'] = requirement['amount'] === undefined ? 1 : requirement['amount'];
    requirement['conditions'] = requirement['conditions'] === undefined ? [] : requirement['conditions'];
    super(requirement);
  }

  conditionFulfilled(condition, matchedEvent) {
    switch(true) {
      case condition['parameter'] !== undefined:
        return condition['value'] === matchedEvent['payload'][condition['parameter']];
      case condition['AnyOf'] !== undefined:
        return this.checkAnyOf(condition['AnyOf'], matchedEvent);
      default:
        throw new Error(`Invalid Condition params: ${JSON.stringify(condition)}`);
    }
  }

  checkAnyOf(conditions, matchedEvent) {
    return conditions.some(c => {
      return this.conditionFulfilled(c, matchedEvent);
    });
  }

  evalConditions(matchedEvent) {
    const conditions = this.requirement.conditions;

    return conditions.every(c => {
      return this.conditionFulfilled(c, matchedEvent);
    });
  }

  async isFulfilled(context, isFirstCycle) {
    // event requirements should be only checked in first achievement cycle
    if (!isFirstCycle) {
      return false;
    }
    const matches = await context.app.service('events').find({
      query: {
        user_id: context.data.user_id,
        name: this.requirement['name']
      }
    });

    const filteredMatches = matches.filter(match => {
      return this.evalConditions(match);
    });
    const matchAmount = filteredMatches.length;
    return Requirement.isValidAmount(matchAmount, this.requirement['amount']);
  }
}

class AnyOfRequirement extends Requirement {
  constructor(innerRequirements) {
    super();
    this.innerRequirements = innerRequirements.map(requirement => Requirement.fromYamlRequirement(requirement));
  }

  async isFulfilled(context, isFirstCycle) {
    for (const requirement of this.innerRequirements) {
      if(await requirement.isFulfilled(context, isFirstCycle)) return true;
    }
    return false;
  }
}

module.exports = function (config_path) {

  let rules = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'));

  const achievementRules = [];

  for (const achievementName of Object.keys(rules['achievements'])) {
    const rule = new AchievementRule(rules['achievements'][achievementName], achievementName);
    achievementRules.push(rule);
  }

  rules['achievements'] = achievementRules;

  return rules;
};
