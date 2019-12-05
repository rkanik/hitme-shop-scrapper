const Product = require('../../models/products')
const scrapper = require('../../scrapper/pickaboo')
const {initPuppeteer} = require('../../src/js/puppeteer')
const SITE_URL = "https://www.pickaboo.com/"

exports.scrap = async ( req , res ) => {

   /** Initializing puppeteer */
   const {page,browser} = await initPuppeteer(SITE_URL)

   /** Scrapping all the informations */
   let mCategories = await scrapper.mCategories(page)
   //let subCategories = await scrapper.subCategories(page)
   let categories = await scrapper.categories(page)
   let hotDeals = await scrapper.hotDeals(page, categories.data)
   let products = await scrapper.products(page, mCategories.data, categories.data)

   /** Closing browser */
   await browser.close()

   /** Returning scrapped data */
   res.json({hotDeals,products})
}

exports.scrapGetAction = async( req , res ) => {
   if( req.params.action === 'mCategories' ){
      const {page,browser} = await initPuppeteer(SITE_URL)
      console.log('Getting Main Categories...');

      let mCategories = await scrapper.mCategories(page)
      let categories = await scrapper.categories(page)

      let mCatProducts = {}
      console.log("  |- Done");
      console.log("Geting Products...");
      for( let category of mCategories.data ){
         console.log("|-- "+category.name);
         await page.goto(category.url,{timeout:0,waitUntil:'networkidle2'})
         let products = await scrapper.mCatProducts( page , category , categories )
         console.log("  `-- "+products.length+' products');
         mCatProducts[category.name] = products
      }
      console.log("|-Done");
      await browser.close()
      res.json( {error:false,data:mCatProducts} )

   }else if( req.params.action === 'subCategories' ){
      const {page,browser} = await initPuppeteer(SITE_URL)
      console.log('Getting Main Categories...');

      let mCategories = await scrapper.mCategories(page)
      let subCategories = await scrapper.subCategories(page)
      let categories = await scrapper.categories(page)

      let subCatProducts = {}
      console.log("  |- Done");
      console.log("Geting Products...");
      for( let category of subCategories ){
         console.log("|-- "+category.name);
         await page.goto(category.url,{timeout:0,waitUntil:'networkidle2'})
         let products = await scrapper.mCatProducts( page , category , categories )
         console.log("  `-- "+products.length+' products');
         subCatProducts[category.name] = products
      }
      console.log("|-Done");
      await browser.close()
      res.json( {error:false,data:subCatProducts} )

   }
   else if( req.params.action === 'categories' ){
      const {page,browser} = await initPuppeteer(SITE_URL)
      console.log('Getting Main Categories...');

      //let mCategories = await scrapper.mCategories(page)
      //let subCategories = await scrapper.subCategories(page)
      let categories = await scrapper.categories(page)

      let catProducts = {}
      console.log("  |- Done");
      console.log("Geting Products...");
      for( let category of categories ){
         console.log("|-- "+category.name);
         await page.goto(category.url,{timeout:0,waitUntil:'networkidle2'})
         let products = await scrapper.mCatProducts( page , category , categories )
         console.log("  `-- "+products.length+' products');
         catProducts[category.name] = products

         res.write( JSON.stringify(products) )
      }
      console.log("|-Done");
      await browser.close()
      res.end()

   }
   else{
      res.send({
         error:true,
         message:'Unknown action'
      })
   }
}

exports.scrapPostAction = async ( req , res ) => {
   if( req.params.action === 'filter-duplicates' ){
      let products = req.body;
      for( let product of products ){
         await Product.find({ title: product.title,
            url:product.url },'title',(err, title ) => {
            if( err ){
               console.log(err);
            }else if( title === null ){
               product.exist = true
            }
         })
      }
      products = products.filter( pro => !pro.exist )
      res.json( products )
   }else{
      res.send({
         error:true,
         message:'Unknown Action'
      })
   }
}

exports.create = async ( req , res ) => {
   let products = req.body;let error = false;
   for( let product of products ){
      let proModel = new Product( product )
      try { await proModel.save()}
      catch (err) {res.json({code:err.code,message:err.errmsg});error=true;break}
   }
   if(!error){res.json({message:'SAVED'})}
}