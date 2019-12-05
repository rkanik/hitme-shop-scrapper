const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
   mCat: {
      type: String,
      required: [true, "Main category is required!"]
   },
   sCat: {
      type: String,
      required: [true, "Sub category is required!"]
   },
   cat: {
      type: String,
      required: [true, "Category name is required!"]
   },
   keywords: {
      type: Array,
      default: []
   }
});

exports.categories = mongoose.model("categories", categoriesSchema);
exports.keysInReview = mongoose.model("keys-in-review", categoriesSchema);
