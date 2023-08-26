const productPrice = require('./productPrice');
const mongoose = require('mongoose');

const productPriceMobileSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true,
        trim: true
    },
    storage: {
        type: String,
        required: true,
        trim: true
    }
});

// Add the discriminator for mobile articleç
const ProductPriceMobile = productPrice.discriminator('ProductPriceMobile', productPriceMobileSchema);

module.exports = ProductPriceMobile