
/** PACKAGE IMPORTS */
const express = require('express')
const router = express.Router()

const daraz = require("../../controllers/daraz/index")

/** ajkerdeal routes */
//router.route("/").get(daraz.scrap)

router.route("/categories").get(daraz.getCategories)
router.route("/hot-deals").get(daraz.getHotDeals)
router.route("/sliders").get(daraz.getSliders)
router.route("/home-products").get(daraz.getHomePageProducts)
router.route("/category-products").get(daraz.getCategoryProducts)

router.route("/scrap-assort-save").get(daraz.scrapAssortSave)

router.route("/:action").get(daraz.actions)

module.exports = router