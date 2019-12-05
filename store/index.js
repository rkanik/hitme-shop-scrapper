const proCollection = require("../models/products/");
const { categories } = require("../models/categories/");
const { keysInReview } = require("../models/categories/");
const proInReview = require("../models/products/inReview");
const sliders = require("../models/sliders/");
const scrapperLog = require("../models/scrapper-log");
const { getSubWords } = require("../scrapper/helper/helper");

class Store {
   //constructor(products, sliders) { this.products = products }

   setProducts(products) {
      this.products = products;
   }

   getUniqueArrayOfObject(array) {
      return [...new Set(array.map(o => JSON.stringify(o)))].map(s =>
         JSON.parse(s)
      );
   }

   async insert(product) {
      try {
         await proCollection.init();
         let res = await proCollection.create(product);
         return { error: false, status: "Inserted", data: res };
      } catch (error) {
         if (error.message.includes("duplicate key")) {
            return { error: true, duplicate: true, message: error.message };
         }
      }
   }

   async getCategory(title) {
      let matched = [];
      let tags = getSubWords(title);
      for (let key of tags) {
         let filedsToSelect = "mCat sCat cat -_id";
         let docRes = await categories
            .findOne({ keywords: key })
            .select(filedsToSelect);
         if (docRes !== null) matched.push(docRes);
      }
      return this.getUniqueArrayOfObject(matched);
   }

   async saveProductInReview(pro) {
      console.log("  | Saving in review");
      try {
         await proInReview.init();
         let res = await proInReview.create(pro);
         return { error: false, status: "Inserted", data: res };
      } catch (error) {
         if (error.message.includes("duplicate key")) {
            return { error: true, duplicate: true, message: error.message };
         }
      }
   }

   async saveKeysInReview(title, conditions) {
      let keywords = getSubWords(title);
      if ((await keysInReview.countDocuments(conditions).limit(1)) === 0) {
         let data = { ...conditions, ...{ keywords } };
         console.log("  Keys created for review");
         await keysInReview.init();
         let createRes = await keysInReview.create(data);
         return createRes;
      } else {
         console.log("  Keys updated");
         let updateRes = await keysInReview.updateOne(conditions, {
            $addToSet: { keywords }
         });
         return updateRes;
      }
   }

   async saveSlider(slider) {
      try {
         await sliders.init();
         let res = await sliders.create(slider);
         return { error: false, status: "OK", data: res };
      } catch (error) {
         return { error: true, message: "Slider already exist!" };
      }
   }

   async saveSliders(sliders) {
      let log = { scrapped: 0, saved: 0, exist: 0 };
      log.scrapped = sliders.length;
      for (let slider of sliders) {
         try {
            let res = await this.saveSlider(slider);
            if (res.error) {
               log.exist += 1;
            } else if (res.status == "OK") {
               log.saved += 1;
            }
         } catch (error) {}
      }
      return { error: false, status: "OK", log };
   }

   async saveProducts(products) {
      let log = { scrapped: 0, saved: 0, inReview: 0, exist: 0 };
      log.scrapped = products.length;
      let counter = 1;
      /** Main loop for per product iteration */
      for (let pro of products) {
         console.log(`\n#${counter}/${products.length} Product : ${pro.title}`);
         counter += 1;

         let catRes = await this.getCategory(pro.title_low);

         if (catRes.length === 0 || catRes.length > 1) {
            if (catRes.length > 1) pro.cats = catRes;
            let inRvRes = await this.saveProductInReview(pro);
            if (inRvRes && !inRvRes.error) log.inReview += 1;
            else {
               console.log("     |--Already exist in review");
            }
         } else {
            let cat = catRes[0];
            (pro.mCat = cat.mCat), (pro.sCat = cat.sCat), (pro.cat = cat.cat);
            let createRes = await this.insert(pro);
            if (createRes && !createRes.error) {
               log.saved += 1;
               console.log(`  |-${createRes.status}-|`);
               await this.saveKeysInReview(pro.title_low, cat);
            } else {
               log.exist += 1;
               console.log("  |--DUPLICATE--|");
            }
         }
      }
      return { error: false, status: "OK", log };
   }

   async saveScrapLog(log) {
      try {
         await scrapperLog.create(log);
      } catch (error) {}
   }
}

module.exports = Store;
