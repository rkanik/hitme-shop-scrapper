
/** PACKAGE IMPORTS */
const express = require('express')
const router = express.Router()

const picka = require('../../controllers/pickaboo/')

/** ajkerdeal routes */
router.route("/").get(picka.scrap)

router.route("/categories").get(picka.getCategories)
router.route("/hot-deals").get(picka.getHotDeals)
router.route("/sliders").get(picka.getSliders)
router.route("/home-products").get(picka.getHomePageProducts)
router.route("/category-products").get(picka.getCategoryProducts)

router.route("/scrap-assort-save").get(picka.scrapAssortSave)

router.route("/:action").get(picka.actions)

module.exports = router