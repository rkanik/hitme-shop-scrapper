const PickabooScrapper = require("../scrapper/pickaboo/");
const DarazScrapper = require("../scrapper/daraz/daraz");
const AjkerdealScrapper = require("../scrapper/ajkerdeal/");
const PriyoshopScrapper = require("../scrapper/priyoshop");
const scrapperLog = require("../models/scrapper-log");

/** Module Imports */
const axios = require("axios");
const puppeteer = require("../src/js/puppeteer");
const autoScroll = require("../src/js/auto-scroll");

const websites = require("../src/js/websites");

const API = process.env.API;
const Store = require("../store/");
const fs = require("fs");

/** Sleep function to delay code execution */
const SECOND = "Second",
   MINUTE = "Minute",
   HOUR = "Hour";
const sleep = (VALUE, UNIT = "MILLI_SECOND") => {
   return new Promise((resolve, reject) => {
      try {
         if (UNIT === SECOND) VALUE *= 1000;
         else if (UNIT === MINUTE) VALUE *= 1000 * 60;
         else if (UNIT === HOUR) VALUE *= 1000 * 60 * 60;
         setTimeout(() => {
            resolve();
         }, VALUE);
      } catch (error) {
         reject({ error: true, message: error.message });
      }
   });
}; /** End of sleep */

const before = (TIME, UNIT = SECOND) => {
   let diff = Date.now() - new Date(TIME).getTime();
   if (UNIT === SECOND) diff /= 1000;
   else if (UNIT === MINUTE) diff /= 1000 * 60;
   else if (UNIT === HOUR) diff /= 1000 * 60 * 60;
   return Math.round(diff);
};

var log = {
   website: "",
   startedAt: Date.now(),
   endedAt: Date.now(),
   categories: { mCat: 0, sCat: 0, cat: 0 },
   sliders: {},
   products: { topSale: {}, homePage: {}, category: { total: 0, details: [] } }
};

const resetLog = () => {
   log = {
      website: "",
      startedAt: Date.now(),
      endedAt: Date.now(),
      categories: { mCat: 0, sCat: 0, cat: 0 },
      sliders: {},
      products: {
         topSale: {},
         homePage: {},
         category: { total: 0, details: [] }
      }
   };
};

const scrapPickaboo = async () => {
   console.log("\nScrapping Pickaboo");

   log.website = websites.PICKABOO.NAME;
   log.startedAt = new Date();
   const { page, browser } = await puppeteer.goto(websites.PICKABOO.URL);
   let ps = new PickabooScrapper(page);
   let allCategories = await ps.getAllCategories();
   console.log("  Categories : ", allCategories.log);
   log.categories = allCategories.log;
   let allSliders = await ps.getAllSliders();
   console.log("  Sliders : ", allSliders.log.sliders);
   let hotDeals = await ps.getHotDealsProducts();
   console.log("  Top Sales : ", hotDeals.length);
   let homePage = await ps.getHomePageProducts();
   console.log("  Home Products : ", homePage.length);
   /** New instance of store */
   let store = new Store();
   /** Saving sliders */
   let res = await store.saveSliders(allSliders.data);
   log.sliders = res.log;
   /** Saving products */
   res = await store.saveProducts(hotDeals);
   log.products.topSale = res.log;
   /** Saving Homepage Products */
   res = await store.saveProducts(homePage);
   log.products.homePage = res.log;

   res = await ps.scrapAndSave(allCategories.data);
   log.products.category = res;

   /** Saving the ending time of scrapping */
   log.endedAt = new Date();

   try {
      await scrapperLog.create(log);
      console.log("  Log saved successfully!");
   } catch (error) {
      console.log(`  Error saving Log : ${error.message}`);
   }

   /** Closing browser */
   await browser.close();
};

const scrapDaraz = async () => {
   log.website = websites.DARAZ.NAME;
   log.startedAt = new Date();

   /** Initializing puppeteer */
   const { page, browser } = await puppeteer.goto(websites.DARAZ.URL);
   //const { page, browser } = await puppeteer.initPuppeteer(websites.DARAZ.URL);

   await autoScroll.autoScroll(page, 1000, 70);
   let dz = new DarazScrapper(page);

   let sliders = await dz.getSliders();
   console.log("Sliders : ", sliders.length);

   await dz.loadCherioo();
   let subCategories = await dz.getSubCategories();
   let categories = await dz.getCategories();

   log.categories.sCat = subCategories.length;
   log.categories.cat = categories.length;

   let allCategories = subCategories.concat(categories);
   console.log("Categories : ", allCategories.length);

   await dz.getAllProducts(page, allCategories)

   /** Auto scroll */
   page.click("a.J_ShopMoreBtn");
   await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 0 });
   await autoScroll.autoScroll(page, 3000, 64);

   await dz.updatePage(page);
   let flashSales = await dz.getFlashSells();
   console.log("Flash Sales : ", flashSales.length);

   await page.goBack({ waitUntil: "networkidle2", timeout: 0 });
   await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 0 });

   await autoScroll.autoScroll(page, 1000, 64);
   await autoScroll.scrollClick(page, ".J_LoadMoreButton");
   await dz.updatePage(page);
   let justForYou = await dz.getJustForYou();
   console.log("Just for you : ", justForYou.length);

   /** Closing browser */
   await browser.close();

   let store = new Store();

   let res = await store.saveSliders(sliders);
   log.sliders = res.log;

   res = await store.saveProducts(flashSales);
   log.products.topSale = res.log;

   res = await store.saveProducts(justForYou);
   log.products.homePage = res.log;

   log.endedAt = new Date();



   try {
      await scrapperLog.create(log);
      console.log("Log saved successfully!");
   } catch (error) {
      console.log(`Error saving Log : ${error.message}`);
   }

};

const scrapAjkerDeal = async () => {
   console.log(`\nScrapping Ajkerdeal`);

   log.website = websites.AJKERDEAL.NAME;
   log.startedAt = new Date();

   let { page, browser } = await puppeteer.goto(websites.AJKERDEAL.URL);

   var ad = new AjkerdealScrapper(page);
   await ad.loadCheerio();

   let categories = ad.getAllCategories();
   console.log(`|\n|----Categories : ${JSON.stringify(categories.log)}`);
   log.categories = categories.log;

   let sliders = ad.getSliders();
   console.log(`|\n|----Sliders : ${sliders.length}`);

   let hotDeals = ad.getHotDeals();
   console.log(`|\n|----Hotdeals : ${hotDeals.length}`);

   await autoScroll.autoScroll(page, null, 100);
   await ad.updatePage(page);
   let homePage = ad.getHomePageProducts();
   console.log(`|\n|----Home Page : ${homePage.length}`);

   console.log("\nSaving to database");
   /** New instance of store */
   let store = new Store();

   let counter = 1
   for (let category of categories.data) {
      console.log(`#${counter}/${categories.data.length} : ${category.name}`);
      try {
         await page.goto(category.url, { waitUntil: "networkidle2", timeout: 0 })
         await ad.updatePage(page)

         let products = ad.getProducts()
         console.log(`  scrapped : ${products.length} items`);

         await store.saveProducts(products)

      } catch (error) { }
      counter++
   }
   console.log("|\nScrap Done\n");
   /** Closing browser */
   await browser.close();


   /** Saving sliders */
   let res = await store.saveSliders(sliders);
   log.sliders = res.log;
   /** Saving products */
   les = await store.saveProducts(hotDeals);
   log.products.topSale = res.log;
   /** Saving Homepage Products */
   res = await store.saveProducts(homePage);
   log.products.homePage = res.log;

   /** Saving the ending time of scrapping */
   log.endedAt = new Date();

   try {
      await scrapperLog.create(log);
      console.log("  Log saved successfully!");
   } catch (error) {
      console.log(`  Error saving Log : ${error.message}`);
   }
};

const scrapPriyoshop = async () => {
   console.log("\nScrapping Priyoshop...");
   log.website = websites.PRIYOSHOP.NAME;
   log.startedAt = new Date();

   let { page, browser } = await puppeteer.goto(websites.PRIYOSHOP.URL);
   await autoScroll.autoScroll(page, null, 64)

   let ps = new PriyoshopScrapper()
   await ps.up

   console.log("Saving scrap log...");

   console.log("|==== DONE ====|\n");
};

exports.test = async () => { };

exports.mainLoop = async () => {
   while (true) {
      if (true) {
         resetLog();
         await sleep(5, SECOND);
         await scrapPickaboo();

         resetLog();
         //await sleep(5, SECOND);
         await sleep(2, MINUTE);
         await scrapDaraz();

         resetLog();
         //await sleep(5, SECOND);
         await sleep(2, MINUTE);
         await scrapAjkerDeal();

         resetLog()
         await sleep(5, SECOND)
         await scrapPriyoshop()
      }
      console.log(`\nSleeping for 30 minutes\n`);
      await sleep(30, MINUTE);
   }
};
