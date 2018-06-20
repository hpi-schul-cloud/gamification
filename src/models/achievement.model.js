// Achievement-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
let model;
module.exports = function (app) {
  if (model) {
    return model;
  }

  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const achievement = new Schema({
    user_id: {type: String, required: true},
    name: {type: String, required: true},
    amount: {type: Number, required: true},
    scope: {type: Map, required: false, default: null}
  });
  achievement.index({ user_id: 1, name: 1 }, {unique: true});

  return model = mongooseClient.model('achievement', achievement);
};
