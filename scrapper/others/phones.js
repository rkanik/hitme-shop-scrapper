
const { initPuppeteer } = require('../../src/js/puppeteer')
URL = 'https://www.gsmarena.com/'

exports.getTitles = async (req, res) => {
   try {
      let { page, browser } = await initPuppeteer(URL)
      let brands = await page.evaluate(async () => {
         return Array.from(document.querySelectorAll('.brandmenu-v2 li a')).map(a => {
            return { name: a.innerHTML, url: a.href }
         })
      })
      res.write('[')
      for (let brand of brands) {
         await page.goto(brand.url, { waitUntil: 'networkidle2' });
         let names = await page.evaluate(async () => {
            return Array.from(document.querySelectorAll('.makers ul li a strong span')).map(t => t.innerHTML)
         });let keywords = []
         names.forEach(name => { name.split(' ').forEach(k => keywords.push(k)) })
         keywords = [... new Set(keywords)]
         console.log(keywords);
         brand.keywords = keywords
         res.write(`${JSON.stringify(brand)},`)
      }await browser.close()
      res.write(']');res.end()
   } catch (error) {
      console.log(error.message);
      res.write(JSON.stringify({status:'error',message:error.message}));res.end()
   }
}