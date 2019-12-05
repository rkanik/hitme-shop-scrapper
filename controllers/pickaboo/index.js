
const { initPuppeteer } = require('../../src/js/puppeteer')
const PickabooScrapper = require("../../scrapper/pickaboo/")
const store = require("../../store/store")
const SITE_URL = "https://www.pickaboo.com/"

const defaultError = (res,message) => {
   res.json({error:true,message})
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
      let ps = new PickabooScrapper(page)
      let catRes = await ps.getAllCategories()
      await browser.close()
      res.json(catRes)
   } catch (error) { defaultError( res , error.message )}
}

exports.getHotDeals = async (_, res) => {
   try {
      let { page, browser } = await initPuppeteer(SITE_URL)
      let ps = new PickabooScrapper(page)
      let dealRes = await ps.getHotDealsProducts()
      await browser.close()
      res.json(dealRes)
   } catch (error) { defaultError( res , error.message )}
}

exports.getSliders = async (_, res) => {
   try {
      let { page, browser } = await initPuppeteer(SITE_URL)
      let ps = new PickabooScrapper(page)
      let sliderRes = await ps.getSliders()
      await browser.close()
      res.json(sliderRes)
   } catch (error) { defaultError( res , error.message )}
}

exports.getHomePageProducts = async (_, res) => {
   try {
      let { page, browser } = await initPuppeteer(SITE_URL)
      let ps = new PickabooScrapper(page)
      let homeRes = await ps.getHomePageProducts()
      await browser.close()
      res.json(homeRes)
   } catch (error) { defaultError( res , error.message )}
}

exports.getCategoryProducts = async (_, res) => {
   try {
      let { page, browser } = await initPuppeteer(SITE_URL)
      let ps = new PickabooScrapper(page)
      let categories = (await ps.getAllCategories()).data
      let proRes = await ps.getAllCategoryProducts(categories)
      await browser.close()
      res.json(proRes)
   } catch (error) { defaultError( res , error.message )}
}

exports.actions = (_, res) => {
   res.json({ status: "success", message: 'Response has recieved actions' })
}
