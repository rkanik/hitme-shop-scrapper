
const { categories } = require("../../models/categories/")

const getUniqueArrayOfObject = (array) => {
   return [...new Set(array.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
}

exports.getMatchedCategory = async (title) => {
   let keys = title.toLowerCase().split(" ")
   let matched = []; try {
      for (let key of keys) {
         let filedsToSelect = "mCat sCat cat -_id";
         let docRes = await categories.findOne({ keywords: key }, filedsToSelect)
         if (docRes !== null) matched.push(docRes)
      }
   } catch (error) { console.log(error) }
   return getUniqueArrayOfObject(matched)
}

/*
      res.write("[")

      for (pro of passedProducts) {
         await productsCol.init()
         try {

            await productsCol.create(pro)

            let keywords = pro.title.toLowerCase().split(" ")
            let exKeyRes = await excludeKeysCol.findById(exId)
            let exKeys = exKeyRes.keywords
            keywords = keywords.filter(cat => exKeys.indexOf(cat) === -1)

            let keyOfProduCatsRes = await categoryCol.findOne({ cat: pro.cat }, "cat keywords -_id")
            let keyOfProduCats = keyOfProduCatsRes.keywords

            keyOfProduCats = keyOfProduCats.concat(keywords)
            keyOfProduCats = [...new Set(keyOfProduCats)]

            await categoryCol.update({ cat: pro.cat }, { keywords: keyOfProduCats })

            res.write(JSON.stringify({ title: pro.title, cat: pro.cat, keys: keyOfProduCats }))
            res.write(",")
         } catch (error) {
            console.log(error);
         }
      }

      for (pro of inReview) {
         await inReviewsCol.init()
         try {
            let docRes = await inReviewsCol.create(pro)
            res.write(JSON.stringify(docRes))
            res.write(",")
         } catch (error) {
            res.write(error.toString())
         }
      }
      */

