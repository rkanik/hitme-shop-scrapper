"use strict";

const Store = require("../../store/")
const cheerio = require('cheerio')
const helper = require('../helper/helper')
const websiteName = "Pickaboo"
const flagHot = "Hot deals"
const flagHome = "Home page"
const flagCategory = "Category"

class PickabooScrapper {

   constructor(page) { this.page = page }

   getUniqueArrayOfObject(array) {
      return [...new Set(array.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))
   }

   async getMainCategories() {
      return await this.page.$$eval('.em-menu-link', a => a.map(b => {
         return { name: b.innerText, url: b.href }
      }))
   }

   async getSubCategories() {
      let $ = cheerio.load(await this.page.content())
      let subCats = []; $('.menu-item-depth-3').each((__, _) => {
         let name = $(_).find('h5 a span').text(), url = $(_).find('h5 a').attr('href')
         subCats.push({ name, url })
      }); $('.syn-subcategory-list').each((__, _) => {
         let names = subCats.map(c => c.name); names = [...new Set(names)]
         let cat = { name: $(_).text(), url: this.page.url() + $(_).parent().attr('href') }
         if (!names.includes(cat.name)) subCats.push(cat)
      })
      return subCats.filter(cat => cat.url !== undefined)
   }

   async getCategories() {
      return await this.page.$$eval('.list-text li', x => x.map(_ => {
         return { name: _.firstChild.innerText, url: _.firstChild.href }
      }))
   }

   async getAllCategories() {
      let mCats = await this.getMainCategories()
      let sCats = await this.getSubCategories()
      let cats = await this.getCategories()
      let allCats = mCats.concat(sCats).concat(cats)
      return {
         log: {
            mCat: mCats.length,
            sCat: sCats.length,
            cat: cats.length
         },
         data: allCats,
      }
   }

   async getHomePageProducts() {
      let $ = cheerio.load(await this.page.content()), products = []
      $('.syn-product').each((__, _) => {
         let src = $(_).find('.product-image > img').attr('data-original')
         let title = $(_).find('.syn-product-name > span > a').text().replace(/\r?\n|\r|\t/g, '').split(".").join("").trim()
         let title_low = title.trim().toLowerCase()
         let url = $(_).find('.syn-product-name > span > a').attr('href')
         let sPrice = $(_).find('.syn-product-price').text().replace(/\r?\n|\r|\t/g, '')
         let price = sPrice, oPrice = 0
         sPrice = parseInt(sPrice.split('৳')[1].split(',').join(''))
         if (price.split('৳')[2]) oPrice = parseInt(price.split('৳')[2].split(',').join('')); else oPrice = sPrice
         let discount = ((oPrice - sPrice) / oPrice * 100).toFixed(2) * 1
         let rating = parseFloat($(_).find('.mobile-rating > p.amount-mobile').text().split('/')[0].trim())
         let ratingCount = parseFloat($(_).find('.ratings > .amount > a').text().split('(')[1].split(')')[0])
         products.push({
            title,
            title_low,
            src,
            url,
            rating,
            ratingCount,
            flag: flagHome,
            sPrice,
            oPrice,
            discount,
            website: websiteName
         });
      }); return products
   }

   async getHotDealsProducts() {
      let $ = cheerio.load(await this.page.content()), deals = []
      $('.syn-view > .product-item').each((__, _) => {
         let url = $(_).find('.syn-product-image > a').attr('href')
         let src = $(_).find('.syn-product-image > a > img').attr('src')
         let sPrice = $(_).find('.syn-product-price').text().replace(/\r?\n|\r|\t/g, '')
         let price = sPrice, oPrice = 0; sPrice = parseInt(sPrice.split('৳')[1].split(',').join(''))
         if (price.split('৳')[2]) oPrice = parseInt(price.split('৳')[2].split(',').join('')); else oPrice = sPrice
         let title = $(_).find('.syn-product-name > a > span').text().split(".").join("").trim()
         let title_low = title.trim().toLowerCase()
         let rating = parseInt($(_).find('.mobile-rating > p').text().split('/')[0].trim())
         let ratingCount = parseFloat($(_).find('.ratings > .amount > a').text().split('(')[1].split(')')[0])
         let discount = (((oPrice - sPrice) / oPrice) * 100).toFixed(2) * 1
         deals.push({
            title,
            title_low,
            src,
            url,
            rating,
            ratingCount,
            flag: flagHot,
            sPrice,
            oPrice,
            discount,
            website: websiteName
         });
      }); return deals
   }

   async getCategoryProducts() {
      let $ = cheerio.load(await this.page.content())
      let products = []
      $('.product-item').each((__, _) => {
         if ($(_).find(".out-of-stock span").text() !== "SOLD OUT") {
            let title = $(_).find('.product-name > a').text().trim()
            let title_low = title.trim().toLowerCase()
            let url = $(_).find('.product-name > a').attr('href')
            let src = $(_).find('.product-image > img').attr('src')
            let rating = parseFloat($(_).find('.amount-mobile').text().split('/')[0].trim())
            let ratingCount = parseInt($(_).find('.ratings > .amount > a').text().split("(")[1].split(')')[0])
            let spPriceEl = $(_).find('.special-price > .price')
            let sPrice, oPrice;
            if (spPriceEl.text() !== '') {
               sPrice = helper.formatTk(spPriceEl.text())
               oPrice = helper.formatTk($(_).find('.old-price > .price').text())
            } else { sPrice = oPrice = helper.formatTk($(_).find('.regular-price > .price').text()) }
            let discount = helper.calcDiscount(oPrice, sPrice)
            if (url !== undefined) {
               products.push({
                  title,
                  title_low,
                  url,
                  src,
                  rating,
                  ratingCount,
                  sPrice,
                  oPrice,
                  discount,
                  flag: flagCategory,
                  website: websiteName
               });
            }
         }
      })
      return products
   }

   async getAllCategoryProducts(categories) {
      let allProducts = []
      console.log("\nGetting all category products...");

      let counter = 1;
      for (let cat of categories) {
         console.log(`#${counter}/${categories.length} ${cat.name}`);
         counter += 1
         await this.page.goto(cat.url, { waitUntil: 'networkidle2' })
         let products = await this.getCategoryProducts()
         console.log(`  pro : ${products.length}\n`);
         if (products.length !== 0) {
            allProducts = allProducts.concat(products);
         }
      }
      return allProducts
   }

   async getAllProducts(categories) {
      let homePageProducts = await this.getHomePageProducts()
      let hotDealsProducts = await this.getHotDealsProducts()
      let log = {
         topSale: {scrapped:hotDealsProducts.length},
         homePage: {scrapped:homePageProducts.length},
         category: {
            total: 0,
            details:[]
         }
      }
      let categoryProducts = []
      for (let category of categories) {
         await this.page.goto(category.url, { waitUntil: 'networkidle2' })
         let products = await this.getCategoryProducts()
         log.category.details.push({
            name:category.name , scrapped : products.length
         })
         if (products.length !== 0) {
            categoryProducts = categoryProducts.concat(products);
            console.log({ name: category.name, product: products.length })
         }

      }
      let allUniqueProducts = this.getUniqueArrayOfObject(
         homePageProducts
            .concat(hotDealsProducts)
            .concat(categoryProducts)
      )
      log.category.total = allUniqueProducts.length
      return { log, data: allUniqueProducts }
   }

   async getSliders() {
      return await this.page.$$eval(".owl-item .item a", (x, website) => x.map(y => {
         return {
            url: y.href, website: website,
            src: y.querySelector('img').getAttribute('data-src') || y.querySelector('img').src
         }
      }), websiteName)
   }

   async getCovers() {
      return await this.page.$$eval('.img-banner .banner-img', (x, website) => x.map(y => {
         return { src: y.children[0].src, url: y.href, website: website }
      }), websiteName)
   }

   async getAllSliders() {
      let allSliders = (await this.getSliders()).concat(await this.getCovers())
      return { log: { sliders: allSliders.length }, data: allSliders }
   }

   async scrapAndSave( categories ) {
      let log = {total: {scrapped: 0,saved: 0,inReview: 0,exist:0},details:[]}
      console.log("\nGetting all category products...");
      let counter = 1;
      for (let cat of categories) {
         console.log(`#${counter}/${categories.length} ${cat.name}`);
         counter += 1; await this.page.goto(cat.url, { waitUntil: 'networkidle2' })
         let products = await this.getCategoryProducts()
         console.log(`  pro : ${products.length}\n`);
         if (products.length !== 0) {
            let store = new Store()
            let res = await store.saveProducts(products)
            if (res.status === 'OK') {
               log.total.scrapped += res.log.scrapped
               log.total.saved += res.log.saved
               log.total.inReview += res.log.inReview
               log.total.exist += res.log.exist
               let inLog = res.log; inLog.name = cat.name; log.details.push(inLog)
            }
         }
      }
      return log
   }
}

module.exports = PickabooScrapper