
const express = require('express')
const router = express.Router()

const search = require('../../controllers/search/')

router.route("/:key")
   .get(search.getProducts)

module.exports = router