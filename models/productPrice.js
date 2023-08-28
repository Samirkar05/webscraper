const mongoose = require('mongoose');

const baseOptions = {
    discriminatorKey: 'productType',  // our discriminator key, could be named anything
    collection: 'Market',            // setting the name of the collection
};

const productPriceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true
    },
    currentPrice: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    store: {
        type: String,
        required: false,
        trim: true
    },
    storeLocation: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, baseOptions);


const ProductPrice = mongoose.model('ProductPrice', productPriceSchema);


module.exports = ProductPrice;
