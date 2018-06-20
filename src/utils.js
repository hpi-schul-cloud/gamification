module.exports = {
  getNestedValue: (obj, key) => {
    return key.split(':').reduce((result, key) => {
      return result !== undefined && result.hasOwnProperty(key) ? result[key] : undefined;
    }, obj);
  },
};
