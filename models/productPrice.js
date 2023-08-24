const mongoose = require('mongoose');
const { Schema } = mongoose;

const productPriceSchema = new Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    currentPrice: {
        type: Number,
        required: true
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
});

const ProductPrice = mongoose.model('ProductPrice', productPriceSchema);

module.exports = ProductPrice;
