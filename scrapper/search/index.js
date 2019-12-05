
const daraz = require('../daraz')
const ajkeerdeal = require('../ajkerdeal/')

exports.getProducts = async (page, index) => {
   
   if (index === 0) { return await daraz.getProducts( page )}
   else if( index === 1 ){ return await ajkeerdeal.getProducts( page )}
   else{ return [] }

}