
const { initPuppeteer } = require('../../src/js/puppeteer')
const { autoScroll } = require("../../src/js/auto-scroll")
const ajkerdeal = require("../../scrapper/ajkerdeal/")

const SITE_URL = "https://ajkerdeal.com/en/"

exports.scrap = async (_, res) => {
   try {
      const { page, browser } = await initPuppeteer(SITE_URL)
      await ajkerdeal.loadPageContent(page)

      let mCategories = ajkerdeal.mCategories()
      let subCategories = ajkerdeal.subCategories()
      let categories = ajkerdeal.categories()

      await autoScroll(page, 1000, 150)
      let hotDeals = ajkerdeal.hotDeals()

      await browser.close()
      res.send({ hotDeals, mCategories, subCategories, categories })

   } catch (error) {
      res.send({ error: true, message: error.message })
   }
}

exports.getProducts = async (req, res) => {
   try {
      const { page, browser } = await initPuppeteer(SITE_URL)
      await ajkerdeal.loadPageContent(page)

      let categories
      if (req.query.wtg === 'mCategories') {
         categories = ajkerdeal.mCategories()
      } else if (req.query.wtg === 'sCategories') {
         categories = ajkerdeal.subCategories()
      } else if (req.query.wtg === 'categories') {
         categories = ajkerdeal.categories()
      }

      res.write("{")
      for (let cat of categories.data) {
         console.log("|--" + cat.name);
         await page.goto(cat.url, { waitUntil: 'networkidle2' })
         let products = await ajkerdeal.getProducts(page)
         res.write(`"${cat.name}":${JSON.stringify(products)},`)
      }

      await browser.close()
      res.write('}'); res.end()
      //res.send( categories )
   } catch (error) {
      console.log("ERROR");
      res.write(JSON.stringify({ error: true, message: error.message }))
      res.end()
   }
}

exports.create = (_, res) => {
   res.send('ajkerdeal create')
}