const productPrice = require('./productPrice');
const mongoose = require('mongoose');

const productPriceMobileSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    storage: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    }
});

productPriceMobileSchema.post('save', (doc, next) =>{
    console.log("Created product price mobile", doc.name + doc.storage, "at cost", doc.currentPrice, ` [${new Date()}]`)
    next()
})
// Add the discriminator for mobile articleç
const ProductPriceMobile = productPrice.discriminator('ProductPriceMobile', productPriceMobileSchema);

module.exports = ProductPriceMobile