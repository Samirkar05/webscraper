const BaseArticle = require('./baseArticle');
const mongoose = require('mongoose');


const ElectricScooterSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true,
    }
    // brand: {
    //     type: String,
    //     required: true
    // },
    // model: {
    //     type: String,
    //     required: true
    // },
    // batteryRange: {
    //     type: String,
    //     required: true
    // },
    // topSpeed: {
    //     type: Number
    // },
    // weight: {
    //     type: Number
    // },
    // chargingTime: String,
    // tireSize: String,
    // features: [String]  // List of features like "Foldable", "LED Lights", etc.
});
ElectricScooterSchema.post('save', async function (doc, next) {
    console.log("Saved ", doc.name);
    next();
});

const ElectricScooterArticle = BaseArticle.discriminator('ElectricScooter', ElectricScooterSchema);

module.exports = ElectricScooterArticle;
