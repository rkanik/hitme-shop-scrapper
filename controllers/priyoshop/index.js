
const { initPuppeteer } = require('../../src/js/puppeteer')
const { autoScroll, scrollToElement  } = require("../../src/js/auto-scroll")
const priyoshop = require("../../scrapper/priyoshop/")
const SITE_URL = "https://www.priyoshop.com"

exports.scrap = async (_, res) => {
   try {
      const { page, browser } = await initPuppeteer(SITE_URL)

      await priyoshop.loadPageContent(page, SITE_URL)

      let mCategories = priyoshop.mCategories(page)
      let subCategories = priyoshop.subCategories(page)
      let categories = priyoshop.categories(page)

      let products = await priyoshop.homeProducts(page)

      await browser.close()

      res.send({ products, mCategories, subCategories, categories })
   } catch (error) {
      console.log("ERROR => ",error.message);
      res.send('error')
   }
}

exports.mCatProducts = async (_, res) => {
   const { page, browser } = await initPuppeteer(SITE_URL)
   await priyoshop.loadPageContent(page, SITE_URL)
   let mCategories = priyoshop.mCategories(page)
   for (let mCat of mCategories.data) {
      console.log("|--" + mCat.name);
      await page.goto(mCat.url, { waitUntil: 'networkidle2' })
      //await scrollToElement(page, '.footer')
      await autoScroll( page , null , 20 )

   }

   await browser.close()

   res.send("DONE")
}

exports.create = (_, res) => {
   res.send('priyoshop create')
}