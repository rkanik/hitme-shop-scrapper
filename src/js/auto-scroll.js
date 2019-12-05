
exports.autoScroll = async ( page, pts=null,speed=100 ) => {
   await page.evaluate(async (o) => {
      //if(o.pts===null)o.pts=document.body.scrollHeight
      await new Promise((resolve, reject ) => {
         var totalHeight = 0, distance = 64
         var timer = setInterval(() => {
            let scrollHeight = o.pts || document.body.scrollHeight
            console.log(scrollHeight);
            window.scrollBy(0, distance);totalHeight += distance
            if (totalHeight >= scrollHeight) {clearInterval(timer);resolve()}
         },o.speed)})
   },{pts,speed})
}

exports.scrollToElement = async ( page , query ) => {
   await page.evaluate( async query => {
      await new Promise( async ( resolve , reject ) => {
         document.documentElement.style.cssText="scroll-behavior:smooth"
         let id="scroll";let element = await document.querySelector(query)
         element.id = id; document.getElementById(id).scrollIntoView()
         setTimeout(() => {resolve()},element.scrollHeight*1.5)
      })
   }, query )
}

exports.scrollClick = async ( page , toClick ) => {
   await page.evaluate(async ( toClick ) => {
      await new Promise((resolve, reject ) => {
         var totalHeight = 0;var distance = 100;
         var timer = setInterval(() => {
            document.querySelector(toClick).click()
            window.scrollBy(0, distance);totalHeight += distance
            if (totalHeight >= document.body.scrollHeight) {clearInterval(timer);resolve()}
         },100)})
   },toClick)
}

exports.clickExpandScroll = async ( page , depQuery , clickQuery ) =>{
   await page.evaluate( async d => {
      await new Promise( async ( resolve , reject ) => {
         let bText = document.querySelector(d.depQuery)
         document.documentElement.style.cssText="scroll-behavior:smooth"
         while( bText === null ){
            await setTimeout( async () => {
               let mBtn = await document.querySelector(d.clickQuery)
               await mBtn.click();mBtn.id = "IDD"
               await document.getElementById("IDD").scrollIntoView()
               bText = await document.querySelector(d.depQuery)
            }, mBtn.scrollHeight*1.5)
         }
         resolve()
      })
   },{depQuery, clickQuery})
}