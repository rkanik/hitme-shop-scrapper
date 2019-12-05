const mongoose = require('mongoose')

const sliderSchema = new mongoose.Schema({
   url: {
      type: String,
      required: true,
      unique: true
   },
   src: {
      type: String,
      required: true
   },
   website: {
      type: String,
      required: true
   },
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date, default: Date.now }
})

const Sliders = mongoose.model('sliders', sliderSchema)

module.exports = Sliders