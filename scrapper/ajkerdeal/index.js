
const cheerio = require('cheerio'); var $
const { capitalizeFirstLetter } = require('../helper/helper')

class AjkerdealScrapper {

   constructor(page) { this.page = page }
   async loadCheerio() { this.$ = cheerio.load(await this.page.content()) }
   async updatePage(page) { this.page = page; this.$ = cheerio.load(await this.page.content()) }

   getCategory(parent) {
      let cats = []; this.$(parent).each((__, _) => {
         cats.push({ name: this.$(_).text(), url: this.$(_).attr('href') })
      }); return { error: false, results: cats.length, data: cats }
   }
   getCategories() {
      return this.getCategory('.title-subsubcategory-span > a')
   }
   getSubCategories() {
      return this.getCategory('.title-subcategory-span > a')
   }
   getMainCategories() {
      return this.getCategory('.title-category-span > a')
   }
   getAllCategories() {
      let mCats = this.getMainCategories().data
      let sCats = this.getSubCategories().data
      let cats = this.getCategories().data
      return {
         log: {
            mCat: mCats.length, sCat: sCats.length, cat: cats.length
         },
         data: mCats.concat(sCats).concat(cats)
      }
   }
   getSliders() {
      let data = []; this.$('.carousel-inner > .item').each((__, _) => {
         let url = this.$(_).find('a').attr('href')
         let src = this.$(_).find('img').attr('src')
         let website = "Ajkerdeal"
         data.push({ website, url, src })
      })
      return data
   }
   getProducts = () => {
      let items = []; this.$('.deal-info-container').each((__, _) => {
         let src = this.$(_).find('.deal-image-container > a > .deal_image').attr('src')
         let title = this.$(_).find('.deal-title-container > h1 > a').text()
         let oPrice = this.$(_).find('.deal-price-container').text().replace(/৳|-|,/g, '').replace('/', '') * 1
         let url = this.$(_).find('.deal-image-container > a').attr('href')
         let rating = this.$(_).find(' span.diamond-yellow > span').attr('style').replace(/width:|px;/g, "") * 1
         items.push({
            title, title_low: title.toLowerCase(), src, url, oPrice, sPrice: oPrice, rating,
            ratingCount: 0, discount: 0, flag: 'Hot Deals',
            website: "Ajkerdeal"
         })
      }); return items
   }
   getHotDeals() {
      let deals = []; this.$('.hot-product-flash-deal').each((__, _) => {
         let url = this.$(_).find('a').attr('href'), splittedUrl = url.split("/")
         let title = splittedUrl[splittedUrl.length - 1].split("-").join(" ").trim()
         let title_low = title.toLowerCase()
         title = capitalizeFirstLetter(title)
         let src = this.$(_).find('a > .crazy-deal > img').attr('src')
         let sPrice = this.$(_).find('.price-text').text().replace('৳', '') * 1
         let discount = this.$(_).find('.percentage-amount-new').text() * 1
         let oPrice = Math.round(sPrice * (100 / discount))
         deals.push({
            title, title_low, url, src, sPrice, oPrice,
            discount, rating: 0, ratingCount: 0, flag: 'Hot Deals',
            website: "Ajkerdeal"
         })
      })
      return deals
   }

   getHomePageProducts() {
      let data = []; this.$('.home-category-product-wrapper').each((__, _) => {
         let src = this.$(_).find('.home-category-product-image > a > img').attr('src')
         let title = this.$(_).find('.home-category-product-title > a').text().trim()
         let title_low = title.toLowerCase()

         let url = this.$(_).find('.home-category-product-image > a').attr('href')
         let sPrice = this.$(_).find(".home-category-product-price").text().replace('৳', '') * 1

         title !== "" && data.push({
            title, src, title_low, url, sPrice, oPrice: sPrice, discount: 0, rating: 0,
            ratingCount: 0, website: 'Ajkerdeal', flag: 'Home Page'
         })
      })
      return data.filter(pro => pro.title !== "")
   }

}

module.exports = AjkerdealScrapper

const getCategory = (root) => {
   let cats = []; $(root).each((__, _) => {
      cats.push({ name: $(_).text(), url: $(_).attr('href') })
   }); return { error: false, results: cats.length, data: cats }
}

exports.loadPageContent = async (page) => { $ = cheerio.load(await page.content()) }
exports.mCategories = () => { return getCategory('.title-category-span > a') }
exports.subCategories = () => { return getCategory('.title-subcategory-span > a') }
exports.categories = () => { return getCategory('.title-subsubcategory-span > a') }

exports.hotDeals = () => {
   let deals = []; $('.hot-product-flash-deal').each((__, _) => {
      let url = $(_).find('a').attr('href'), splittedUrl = url.split("/")
      let title = splittedUrl[splittedUrl.length - 1].split("-").join(" ")
      title = capitalizeFirstLetter(title)
      let src = $(_).find('a > .crazy-deal > img').attr('src')
      let sPrice = $(_).find('.price-text').text().replace('৳', '') * 1
      let discount = $(_).find('.percentage-amount-new').text() * 1
      let oPrice = Math.round(sPrice * (100 / discount))
      deals.push({ title, url, src, sPrice, oPrice, discount })
   })
   return deals
}

exports.getProducts = async (page) => {
   let items = []; let $ = cheerio.load(await page.content())
   $('.deal-info-container').each((__, _) => {
      let src = $(_).find('.deal-image-container > a > .deal_image').attr('src')
      let title = $(_).find('.deal-title-container > h1 > a').text()
      let oPrice = $(_).find('.deal-price-container').text().replace(/৳|-|,/g, '').replace('/', '') * 1
      let url = $(_).find('.deal-image-container > a').attr('href')
      let rating = $(_).find(' span.diamond-yellow > span').attr('style').replace(/width:|px;/g, "") * 1
      items.push({
         title, src, url, oPrice, sPrice: oPrice, rating,
         ratingCount: 0, discount: 0
      })
   }); return items
}

/*
exports.mCatProducts = async (page) => {
    return await getProducts( page )
}

exports.subCatProducts = async (page) => {
    return await getProducts( page )
}

exports.catProducts = async (page) => {
    return await getProducts( page )
}
*/