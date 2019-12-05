/** PACKAGE IMPORTS */
const express = require('express')
const router = express.Router()

const catController = require("../../controllers/categories/")

/** Categories */
router.route("/")
   .get(catController.getCategories)

router.route("/main-categories")
   .get(catController.mainCategories)

router.route("/sub-categories/:mCatName")
   .get(catController.subCategories)

router.route("/scat-and-cats-of/:mCatName")
   .get(catController.scatAndCats)

router.route("/:catName")
   .get(catController.getCategory)
   .post(catController.createCategory)
   .put(catController.patchCategory)
   .patch(catController.patchCategory)
   .delete(catController.deleteCategory)

router.route("/:catName/keywords/:key")
   .delete(catController.deleteKeyword)

// router.route("/:title")
//    .get(catController.getCategoryFromTitle)

module.exports = router