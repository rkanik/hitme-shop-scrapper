
const express = require('express')

const router = express.Router()

const phone = require('../../scrapper/others/phones')

router.route("/get-all-phones")
   .get(phone.getTitles)

module.exports = router