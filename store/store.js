
const { categories } = require("../models/categories/")
const { keysInReview } = require("../models/categories/")
const excludes = require("../models/categories/excludes")
const slides = require("../models/sliders/")
const productsCollection = require("../models/products/")
const inReviewCollection = require("../models/products/inReview")

const getUniqueArrayOfObject = array => {
   return [...new Set(array.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
}

const getCategoryFromTitle = async title => {
   let keys = title.toLowerCase().split(" ")
   let matched = [];
   for (let key of keys) {
      let exRes = await excludes.findOne({ key })
      if (exRes === null) {
         let filedsToSelect = "mCat sCat cat -_id";
         let docRes = await categories.findOne({ keywords: key }, filedsToSelect)
         if (docRes !== null) matched.push(docRes)
      }
   }
   return getUniqueArrayOfObject(matched)
}

const filterKeysAlreadyInCategories = async (titleKeys, condition) => {
   let keys = []
   for (key of titleKeys) {
      condition.keywords = key
      let docRes = await categories.findOne(condition)
      if (docRes === null) keys.push(key)
   }
   return keys
}

const saveKeysInReview = async (title, condition) => {
   let filteredKeys = await filterKeysAlreadyInCategories(title.toLowerCase().split(" "), condition)
   if (filteredKeys.length > 0) {
      try {
         condition.keywords = filteredKeys
         keysInReview.init()
         await keysInReview.create(condition)
      } catch (error) {
         delete condition.keywords
         let docRes = await keysInReview.findOne(condition)
         filteredKeys = filteredKeys.concat(docRes.keywords)
         filteredKeys = [...new Set(filteredKeys)]
         await keysInReview.updateOne(condition, { keywords: filteredKeys })
      }
   }
}

exports.getPassedAndInreviewProducts = async products => {
   let passedProducts = []
   let inReview = []
   for (let pro of products) {
      let cats = await getCategoryFromTitle(pro.title)
      if (cats.length === 1) {
         let cat = cats[0]
         pro.mCat = cat.mCat, pro.sCat = cat.sCat, pro.cat = cat.cat
         await saveKeysInReview(pro.title, { mCat: pro.mCat, sCat: pro.sCat, cat: pro.cat })
         passedProducts.push(pro)
      } else if (cats.length > 1) {
         pro.cats = cats
         inReview.push(pro)
      } else {
         inReview.push(pro)
      }
   }
   return { passedProducts, inReview }
}

const saveProducts = async (products, collection) => {
   for (let pro of products) {
      try {
         await collection.init()
         await collection.create(pro)

      } catch (error) { }
   }
}

exports.saveSliderImages = async images => {
   await saveProducts(images, slides)
}

exports.savePassedProducts = async products => {
   await saveProducts(products, productsCollection)
}

exports.saveInReviewProducts = async products => {
   await saveProducts(products, inReviewCollection)
}