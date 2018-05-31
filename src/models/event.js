const mongoose = require('mongoose')
const Schema = mongoose.Schema

let EventSchema = new Schema({
  id: Number,
  timestamp: Date,
  user_id: String,
  name: String,
  context: Map
})

EventSchema.index({ id: 1 })

module.exports = mongoose.model('Event', EventSchema)
