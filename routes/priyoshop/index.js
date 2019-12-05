/** PACKAGE IMPORTS */
const express = require('express')
const router = express.Router()

const priyoshop = require('../../controllers/priyoshop/')

/** Priyoshop routes */
router.route("/")
   .get(priyoshop.scrap)
   .post(priyoshop.create)

router.route("/mcat-products")
   .get(priyoshop.mCatProducts)

module.exports = router