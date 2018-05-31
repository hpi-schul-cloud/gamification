// Event-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const event = new Schema({
    user_id: {type: String, required: true},
    name: {type: String, required: true},
    context: {type: Map, required: false, default: {}}
  })

  return mongooseClient.model('event', event);
};
