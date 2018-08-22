const assert = require('chai').assert;
const AchievementRule = require('../src/rule-parser').AchievementRule;

describe('Achievement Rule Tests', () => {
  it('parses maxAwarded and maxAwardedTotal correctly', () => {
    [
      [undefined, undefined, 1, 1                       ],
      [5,         undefined, 5, Number.POSITIVE_INFINITY],
      [undefined, 5,         5, 5                       ],
      [5,         6,         5, 6                       ]
    ].forEach(testCase => {
      const [maxAwarded, maxAwardedTotal, expectedMaxAwarded, expectedMaxAwardedTotal] = testCase;
      const rule = new AchievementRule({
        maxAwarded: maxAwarded,
        maxAwardedTotal: maxAwardedTotal
      }, 'PizzaAchievement');
      assert(rule.maxAwarded, expectedMaxAwarded);
      assert(rule.maxAwardedTotal, expectedMaxAwardedTotal);
    });
  });

  it('throws an error if maxAwardedTotal is lower than maxAwarded', () => {
    assert.throws(() => {
      new AchievementRule({
        maxAwarded: 6,
        maxAwardedTotal: 5
      }, 'PizzaAchievement');
    }, Error);
  });
});
