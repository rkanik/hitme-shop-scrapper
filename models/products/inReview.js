const mongoose = require('mongoose')

const reviewsSchema = new mongoose.Schema({
   title: String,
   title_low: String,
   src: String,
   url: {
      type: String,
      required: [true, "An url is required!"],
      unique: true
   },
   sPrice: Number,
   oPrice: Number,
   rating: { type: Number, default: 0 },
   ratingCount: { type: Number, default: 0 },
   discount: Number,
   flag: String,
   website: String,
   cats: {
      type: Array,
      required: false
   },
   createdAt: { type: Date, default: Date.now }
})

const inReview = mongoose.model('pro-in-review', reviewsSchema)

module.exports = inReview