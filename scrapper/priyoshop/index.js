const cheerio = require('cheerio')

var $, SITE_URL

class PriyoshopScrapper {

   constructor(page) { this.page = page }
   async loadCheerio() { this.$ = cheerio.load(await this.page.content()) }
   async updatePage(page) { this.page = page; this.$ = cheerio.load(await this.page.content()) }


}

module.exports = PriyoshopScrapper

const getCategory = (root) => {
   let cats = []; $(root).each((__, _) => {
      cats.push({ name: $(_).text(), url: `${SITE_URL + $(_).attr('href')}` })
   }); return { error: false, results: cats.length, data: cats }
}

exports.loadPageContent = async (page, siteURL) => {
   $ = cheerio.load(await page.content()); SITE_URL = siteURL
}

exports.mCategories = () => {
   return getCategory('.root-category-items > a:first-child')
}

exports.subCategories = () => {
   return getCategory('.sublist > li > .with-subcategories')
}

exports.categories = () => {
   return getCategory('.sublist > li > .lastLevelCategory')
}

exports.homeProducts = async () => {
   let section = {}
   $('.nop-jcarousel').each((i, a) => {
      let sectionName = $(a).find('h2.carousel-title').text().toLowerCase()
      let products = []; $(a).find('.jcarousel-item').each((__, _) => {
         let title = $(_).find('.jcarousel-product-name').text().replace(/\n/g, '')
         let url = SITE_URL + $(_).find('.jcarousel-product-name').attr('href')
         let src = $(_).find('.thumb-img > img').attr('src')
         let sPrice = $(_).find('.prices > span.actual-price').text().replace(/Tk|,/g, '').trim() * 1
         let oPrice, opEl = $(_).find('.prices > span.old-price').text()
         opEl === '' ? oPrice = sPrice : oPrice = opEl.replace(/Tk|,/g, '').trim() * 1
         let discount = Math.round((oPrice - sPrice) / oPrice * 100)
         products.push({ title, url, src, sPrice, oPrice, discount })
      })
      section[sectionName] = products
   }); return section
}