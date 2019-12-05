const puppeteer = require("puppeteer");
const chromePath = `C:\\Users\\RKAnik\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe`;

exports.goto = async URL => {
   const browser = await puppeteer.launch({ headless: true, devtools: false });
   const page = await browser.newPage();
   await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
   await page.goto(URL, { waitUntil: "networkidle2", timeout: 0 });
   return { page, browser };
};

exports.initPuppeteer = async url => {
   console.log("");
   console.log("-------------------------------");
   console.log("|-- Initializing PUPPERTEER --|");
   console.log("-------------------------------");
   console.log("");

   const browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      //executablePath: chromePath,
      args: ["--start-maximized"]
   });

   const page = await browser.newPage();

   await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1
   });

   console.log(`|-- Going to : ${url} --|`);
   console.log("");

   await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 0
   });
   console.log("|--          DONE           --|");
   console.log("");

   return {
      page,
      browser
   };
};
