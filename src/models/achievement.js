//const mongoose = require('mongoose')
//const Schema = mongoose.Schema
//
//let AchievementSchema = new Schema({
//  text: {
//    type: String,
//    required: true
//  }
//})
//
//const Model = mongoose.model('Achievement', AchievementSchema)
//
//module.exports = Model
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const MessageSchema = new Schema({
  text: {
    type: String,
    required: true
  }
});
const Model = mongoose.model('Message', MessageSchema);

module.exports = Model;
