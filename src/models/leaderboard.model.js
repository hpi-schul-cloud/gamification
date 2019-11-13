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
  const leaderboard = new Schema({
    _id: {type: String, required: true},
    totalPerUser: {type: Number, required: true},
    achievements: {type: Map, required: false, default: null}
  });
  //leaderboard.index({ _id: 1 }, {unique: true});

  return model = mongooseClient.model('leaderboard', leaderboard);
};
