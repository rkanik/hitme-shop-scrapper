
const catCollection = require('../../models/categories/')
const catSubs = require("./subs")

exports.getCategories = (req, res) => {
   let filedsToSelect = "mCat sCat cat keywords";
   catCollection.find({}, filedsToSelect, (err, colRes) => {
      if (err) { res.status(500).send({ status: 'error', data: err }) }
      else {
         res.send(colRes)
      }
   })
}

exports.mainCategories = async (_, res) => {
   try {
      let cRes = await catCollection.find({}, 'mCat -_id')
      cRes = cRes.map(c => c.mCat)
      res.send([...new Set(cRes)])
   } catch (error) {
      res.send({ error: true, message: error.message })
   }
}

exports.subCategories = async (req, res) => {
   try {
      let cRes = await catCollection.find({ mCat: req.params.mCatName }, "sCat -_id")
      cRes = cRes.map(c => c.sCat)
      res.send([...new Set(cRes)])
   } catch (error) {
      res.send({ error: true, message: error.message })
   }
}

exports.scatAndCats = async (req, res) => {
   try {
      let cRes = await catCollection.find({ mCat: req.params.mCatName }, "sCat cat -_id")
      let fData = {}
      let sCats = [...new Set(cRes.map(c => c.sCat))]
      sCats.forEach(sCat => fData[sCat] = (cRes.filter(c => c.sCat === sCat)).map(d => d.cat))
      res.send(fData)
   } catch (error) {
      res.send({ error: true, message: error.message })
   }
}

exports.getCategory = async (req, res) => {
   let filedsToSelect = "mCat sCat cat keywords -_id";
   let docRes = await catCollection.findOne({ cat: req.params.catName }, filedsToSelect);
   res.send(docRes)
}

exports.putCategory = async (req, res) => {
   let docRes = await catCollection.update({ cat: req.params.catName }, req.body)
   res.send(docRes)
}

exports.patchCategory = async (req, res) => {
   let catRes = await catCollection.findOne({ cat: req.params.catName })

   let docRes = await catCollection.update({ cat: req.params.catName }, req.body)
   res.send(docRes)
}

exports.createCategory = async (req, res) => {
   try {
      await catCollection.init()
      let docRes = await catCollection.create(req.body)
      res.send(docRes)
   } catch (error) {
      res.send({ error: true, message: error.message })
   }
}

exports.deleteCategory = async (req, res) => {
   try {
      let docRes = await catCollection.deleteOne({ cat: req.params.catName })
      res.send(docRes)
   } catch (error) {
      res.status(500).send({ error: true, message: error.message })
   }
}

exports.getCategoryFromTitle = async (req, res) => {
   if (req.params.title) {
      res.json(await catSubs.getMatchedCategory(req.params.title))
   } else {
      res.send('error')
   }
}

exports.deleteKeyword = async (req, res) => {
   try {
      delRes = await catCollection.update({ cat: req.params.catName }, { $pull: { keywords: req.params.key} })
      res.send(delRes)
   } catch (error) {
      res.status(500).send({ error: true, message: error.message })
   }
}