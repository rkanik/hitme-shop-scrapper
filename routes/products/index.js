/** PACKAGE IMPORTS */
const express = require('express')
const router = express.Router()

const cntrler = require('../../controllers/products/')

router.route('/products')
   .get(cntrler.getProducts)
   .post(cntrler.createProduct)
   .post(cntrler.createProducts)

router.route('/products/:id')
   .get(cntrler.getProduct)
   .patch(cntrler.updateProduct)
   .delete(cntrler.deleteProduct)

module.exports = router