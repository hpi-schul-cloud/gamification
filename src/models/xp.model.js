// XP-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const xp = new Schema({
    user_id: {type: String, required: true},
    name: {type: String, required: true},
    amount: {type: Number, required: true},
  });

  xp.index({ user_id: 1, name: 1 }, {unique: true});

  return mongooseClient.model('xp', xp);
};
