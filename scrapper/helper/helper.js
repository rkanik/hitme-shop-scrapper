const cheerio = require("cheerio");

exports.getCategory = (title, categories) => {
   let category = { url: null };
   category.name = title.split(" ")[0].toLowerCase();
   let b = categories.map(_ => _.name);
   let bi = b.indexOf(category.name);
   if (bi !== -1) {
      category.url = categories[bi].url;
   }
   return category;
};

exports.formatTk = price => {
   return price.replace(/৳|,/g, "").trim() * 1;
};

exports.calcDiscount = (op, sp) => {
   return (((op - sp) / op) * 100).toFixed(2) * 1;
};

exports.queryCategories = async (page, query, c) => {
   let $ = cheerio.load(await page.content());
   let cats = [];
   $(query).each((__, _) => {
      if (c.remove) {
         $(_)
            .find(c.child)
            .remove();
      }
      let name = $(_)
         .find("a > span")
         .text();
      let url =
         "https:" +
         $(_)
            .find("a")
            .attr("href");
      cats.push({ name, url });
   });
   return cats;
};

exports.capitalizeFirstLetter = string => {
   return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.getSubWords = str => {
   let arr = str.split(" ");

   let newA = [];
   newA.push(str);

   arr.forEach((word, index) => {
      let sStr = "";
      for (let i = 0; i < arr.indexOf(word); i++) {
         if (index != i) sStr += `${arr[i]} `;
      }
      newA.push(sStr.trim());
   });

   arr.forEach((_, index) => {
      let sStr = "";
      for (let i = index + 1; i < arr.length; i++) {
         sStr += ` ${arr[i]}`;
      }
      newA.push(sStr.trim());
   });

   return newA.filter(a => a !== "");
};
