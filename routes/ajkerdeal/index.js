/** PACKAGE IMPORTS */
const express = require('express')
const router = express.Router()

const ajkerdeal = require('../../controllers/ajkerdeal/')

/** ajkerdeal routes */
router.route("/")
   .get(ajkerdeal.scrap)
   .post(ajkerdeal.create)

router.route("/getProducts")
   .get(ajkerdeal.getProducts)

module.exports = router