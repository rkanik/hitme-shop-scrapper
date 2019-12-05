
const daraz = require('../../scrapper/daraz')

const {initPuppeteer} = require('../../src/js/puppeteer')
const { autoScroll, scrollToElement, scrollClick } = require('../../src/js/auto-scroll')

const SITE_URL = 'https://www.daraz.com.bd/'

/** Scrap Home page of Daraz */
exports.scrap = async ( req , res ) => {
   
   const { page , browser } = await initPuppeteer(SITE_URL)

   res.write('{')
   let subCategories = await daraz.subCategories(page)
   res.write('"subCategories":'+JSON.stringify(subCategories)+",")

   let categories = await daraz.categories( page )
   res.write('"categories":'+JSON.stringify(categories)+",")

   //let fsUrl = await daraz.fsUrl( page )
   //await page.goto( fsUrl , { waitUntil : "networkidle2" })

   //await scrollToElement( page , '.item-list:nth-child(2)')
   //let flashSale = await daraz.flashSale( page )
   //res.write('"flashSale":'+JSON.stringify(flashSale)+",")
   //await page.goBack()


   //await scrollClick(page , '.card-jfy-load-more a')
   //let justForYou = await daraz.justForYou( page  )
   //res.write('"justForYou":'+JSON.stringify(justForYou))

   await browser.close()

   res.write("}")
   res.end()
}

exports.create = ( req , res ) => {
   res.send("Create")
}

exports.scrapGetActions = async ( req, res ) => {
   if( req.params.action === 'scrap-subs' ){
      const { page , browser } = await initPuppeteer(SITE_URL)
      console.log("");
      console.log('Getting Subcategories');
      console.log("");
      let subCategories = await daraz.subCategories( page )
      console.log("  |-- done");
      res.write("{"); let counter = 1;
      console.log("");
      console.log("Starting scrapping");
      console.log("");
      for( sub of subCategories.data ){
         console.log(counter+" |-- "+sub.name);counter++
         try {
            await page.goto( sub.url , { waitUntil : "networkidle2",timeout:0 })
            await autoScroll( page, 500 )
            let products = await daraz.productsSubCategories( page , sub )
            products.forEach( p => console.log("     |-- "+p.title.substring(0,50)+"..."))
            res.write(`"${sub.name}":`+JSON.stringify({error:false,results:products.length,data:products})+",")
         } catch (error) {
            console.log("");
            console.log("-------------")
            console.log("|---ERROR---|")
            console.log("-------------")
            console.log("");
            continue
         }
      };await browser.close()
      res.write("}");res.end()
      console.log("")
      console.log("Done")
      console.log("")
   }else if( req.params.action === 'scrap-cats' ){
      const { page , browser } = await initPuppeteer(SITE_URL)
      console.log("");
      console.log('Getting Categories');
      console.log("");
      let subCategories = await daraz.categories( page )
      console.log("  |-- done");
      res.write("{"); let counter = 1;
      console.log("");
      console.log("Starting scrapping");
      console.log("");
      for( sub of subCategories.data ){
         console.log(counter+" |-- "+sub.name);counter++
         try {
            await page.goto( sub.url , { waitUntil : "networkidle2",timeout:0 })
            await autoScroll( page, 500 )
            let products = await daraz.productsSubCategories( page , sub )
            products.forEach( p => console.log("     |-- "+p.title.substring(0,50)+"..."))
            res.write(`"${sub.name}":`+JSON.stringify({error:false,results:products.length,data:products})+",")
         } catch (error) {
            console.log("");
            console.log("-------------")
            console.log("|---ERROR---|")
            console.log("-------------")
            console.log("");
            continue
         }
      };await browser.close()
      res.write("}");res.end()
      console.log("")
      console.log("Done")
      console.log("")
   }
   else{
      res.send({error:true,message:'Unknown action'})
   }
}

exports.scrapPostActions = async ( req , res ) => {
   res.send("OK")
}