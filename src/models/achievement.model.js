// Achievement-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const achievement = new Schema({
    user_id: {type: String, required: true},
    name: {type: String, required: true},
    count: {type: Number, required: true},
    scope: {type: Map, required: false, default: null}
  });

  return mongooseClient.model('achievement', achievement);
};
