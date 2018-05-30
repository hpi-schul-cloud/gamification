const mongoose = require('mongoose')
const Schema = mongoose.Schema

let AchievementSchema = new Schema({
  text: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Achievement', AchievementSchema)
