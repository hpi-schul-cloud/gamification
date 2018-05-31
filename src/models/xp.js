const mongoose = require('mongoose')
const Schema = mongoose.Schema

let XpSchema = new Schema({
  user_id: String,
  name: String,
  value: Number
})

XpSchema.index({ user_id: 1, name: 1 })

module.exports = mongoose.model('XP', XpSchema)
