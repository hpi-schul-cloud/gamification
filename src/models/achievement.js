const mongoose = require('mongoose')
const Schema = mongoose.Schema

let AchievementSchema = new Schema({
  user_id: String,
  name: String,
  count: Number,
  scope: Map
})

AchievementSchema.index({ user_id: 1, name: 1 })

module.exports = mongoose.model('Achievement', AchievementSchema)
