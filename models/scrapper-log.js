
const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
   website: String,
   products: {
      topSale: {
         scrapped: Number,
         saved: Number,
         inReview: Number,
         exist: Number,
      },
      homePage: {
         scrapped: Number,
         saved: Number,
         inReview: Number,
         exist: Number,
      },
      category: {
         total: {
            scrapped: Number,
            saved: Number,
            inReview: Number,
            exist:Number
         },
         details:Array
      }
   },
   sliders: {
      scrapped: Number,
      saved: Number,
      exist: Number
   },
   categories: {
      total: Number,
      mCat: Number,
      sCat: Number,
      cat:Number
   },
   startedAt: Date,
   endedAt: {
      type: Date,
      default:Date.now()
   }
})

const scrapLog = mongoose.model("scrapper-logs", Schema)

module.exports = scrapLog