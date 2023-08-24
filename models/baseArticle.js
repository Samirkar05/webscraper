const mongoose = require('mongoose');

const baseOptions = {
    discriminatorKey: 'articleType',  // our discriminator key, could be named anything
    collection: 'Articles',            // setting the name of the collection
};

const BaseArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price:{
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    imageUrl: [String],
    dateScraped: {
        type: Date,
        default: Date.now
    },
    isShippable:{
        type: Boolean,
        required: true
    },
    sourceWebsite: {
        type: String,
        required: true
    },
    publicationDate:String,
    lastEdited:String,  

}, baseOptions);


const BaseArticle = mongoose.model('BaseArticle', BaseArticleSchema);

module.exports = BaseArticle;
