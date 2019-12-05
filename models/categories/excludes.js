const mongoose = require('mongoose')

const excludesSchema = new mongoose.Schema({
   key: {
      type: String,
      unique: true,
      required: true,
   }
})

const excludes = mongoose.model('excludes', excludesSchema)

module.exports = excludes