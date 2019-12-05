
const { initPuppeteer } = require('../../src/js/puppeteer')
const DarazScrapper = require("../../scrapper/daraz/daraz")
const autoScroll = require("../../src/js/auto-scroll")
const store = require("../../store/store")
const SITE_URL = "https://www.daraz.com.bd/"

const defaultError = (res, message) => {
   res.json({ error: true, message })
}

exports.scrapAssortSave = async (_, res) => {
   try {
      let { page, browser } = await initPuppeteer(SITE_URL)
      let hotDeals = await pickaboo.hotDeals(page)
      let sliders = await pickaboo.sliders(page)
      let homeProducts = await pickaboo.products(page)
      let allProducts = hotDeals.concat(homeProducts)
      await browser.close()
      await store.saveSliderImages(sliders)
      let products = await store.getPassedAndInreviewProducts(allProducts)
      await store.savePassedProducts(products.passedProducts)
      await store.saveInReviewProducts(products.inReview)
      res.json({ error: false, message: "Data successfully scrapped and saved to the database!" })
   } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
   }
}

exports.scrap = async (_, res) => {
   try {

      let { page, browser } = await initPuppeteer(SITE_URL)
      let hotDeals = await pickaboo.hotDeals(page)
      let sliders = await pickaboo.sliders(page)
      let products = await pickaboo.products(page)

      let passedProducts = []
      let inReview = []

      products = products.concat(hotDeals)

      for (let pro of products) {
         let cats = await categorySubs.getMatchedCategory(pro.title)
         if (cats.length === 1) {
            let cat = cats[0]
            pro.mCat = cat.mCat, pro.sCat = cat.sCat, pro.cat = cat.cat
            passedProducts.push(pro)
         } else if (cats.length > 1) {
            pro.cats = cats
            inReview.push(pro)
         } else {
            inReview.push(pro)
         }
      }
      await browser.close()
      res.json({ products: passedProducts, sliders, inReview })
   } catch (error) {
      res.status(500).json({ status: 'error', message: error.message })
   }
}

exports.getCategories = async (_, res) => {
   try {
      let { page, browser } = await initPuppeteer(SITE_URL)
      let dz = new DarazScrapper(page)
      await dz.loadCherioo()
      let catRes = await dz.getAllCategories()
      await browser.close()
      res.json(catRes)
   } catch (error) { defaultError(res, error.message) }
}

exports.getHotDeals = async (_, res) => {
   try {
      let { page, browser } = await initPuppeteer(SITE_URL)
      await autoScroll.autoScroll(page, 1000, 70)
      let dz = new DarazScrapper(page)
      await dz.loadCherioo()
      page.click('a.J_ShopMoreBtn')
      await page.waitForNavigation()
      await autoScroll.autoScroll(page, 3000, 64)
      await dz.updatePage(page)
      let flashSales = await dz.getFlashSells()
      await browser.close()
      res.json(flashSales)
   } catch (error) { defaultError(res, error.message) }
}

exports.getSliders = async (_, res) => {
   try {
      let { page, browser } = await initPuppeteer(SITE_URL)
      await autoScroll.autoScroll(page, 1000, 70)
      let dz = new DarazScrapper(page)
      let sliderRes = await dz.getSliders()
      await browser.close()
      res.json(sliderRes)
   } catch (error) { defaultError(res, error.message) }
}

exports.getHomePageProducts = async (_, res) => {
   try {
      let { page, browser } = await initPuppeteer(SITE_URL)
      let dz = new DarazScrapper(page)
      await autoScroll.autoScroll(page, 3000, 64)
      await autoScroll.scrollClick(page, '.J_LoadMoreButton')
      await dz.updatePage(page)
      let justForYou = await dz.getJustForYou()
      await browser.close()
      res.json(justForYou)
   } catch (error) { defaultError(res, error.message) }
}

exports.getCategoryProducts = async (_, res) => {
   try {
      res.write('{')
      let { page, browser } = await initPuppeteer(SITE_URL)
      let dz = new DarazScrapper(page)
      await dz.loadCherioo()
      let categories = (await dz.getAllCategories()).data
      let proRes = await dz.getAllProducts(page,categories)
      await browser.close()
      res.write(JSON.stringify(proRes)+"}")
      res.end()
   } catch (error) { defaultError(res, error.message) }
}

exports.actions = (_, res) => {
   res.json({ status: "success", message: 'Response has recieved actions' })
}
