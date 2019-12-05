
const search = require('../../scrapper/search/')
const { initPuppeteer } = require('../../src/js/puppeteer')
const { autoScroll } = require('../../src/js/auto-scroll')

const SITES = ["https://www.daraz.com.bd/", "https://ajkerdeal.com/en/",
   "https://www.pickaboo.com/", "https://priyoshop.com/"]

const INPUTS = ["#q", "#SearchTextBox", "#search", "#search-input"]
const BUTTONS = [".search-box__button--1oH7", "#serachClick", ".text-search button", ".search-box-button"]

exports.getProducts = async (req, res) => {
   try {

      let { page, browser } = await initPuppeteer(SITES[0])
      res.write("{")
      for (let i = 0; i < SITES.length; i++) {
         if (i !== 0) { await page.goto(SITES[i], { waitUntil: 'networkidle2' }) }
         await page.focus(INPUTS[i])
         await page.keyboard.type(req.params.key)

         page.click(BUTTONS[i])
         await page.waitForNavigation({ waitUntil: 'networkidle2' })

         await autoScroll( page , 1000 , 50 )

         let p = await search.getProducts(page, i)
         res.write(`"${SITES[i]}":${JSON.stringify(p)},`)

         //await autoScroll( page , 2000 , 50 )
      }

      await browser.close()

      res.write("}");res.end()

   } catch (error) {
      res.write(JSON.stringify({ error: true, message: error.message }))
      res.end()
   }
}