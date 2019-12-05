const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
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
   mCat: String,
   sCat: String,
   cat: String,
   compared: {
      type: Array,
      default: []
   },
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date, default: Date.now }
});
const Products = mongoose.model("products", productSchema);
module.exports = Products;
