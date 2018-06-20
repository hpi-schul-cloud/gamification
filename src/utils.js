module.exports = {
  getNestedValue: (obj, key) => {
    return key.split(':').reduce((result, key) => {
      return result[key];
    }, obj);
  },
};
