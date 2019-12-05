/** PACKAGE IMPORTS */
const express = require('express')
const router = express.Router()

/** Importing controllers */
const daraz = require('../../controllers/scrapper/daraz')
const pickaboo = require('../../controllers/scrapper/pickaboo')


/** Daraz routes */
router.route("/daraz")
   .get(daraz.scrap)
   .post(daraz.create)

router.route("/daraz/:action")
   .get(daraz.scrapGetActions)
   .post(daraz.scrapPostActions)

/** Pickaboo Routes */
router.route("/pickaboo")
   .get(pickaboo.scrap)
   .post(pickaboo.create)

router.route("/pickaboo/:action")
   .get(pickaboo.scrapGetAction)
   .post(pickaboo.scrapPostAction)


/** exporting router */
module.exports = router