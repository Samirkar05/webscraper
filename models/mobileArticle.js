const BaseArticle = require('./baseArticle');
const mongoose = require('mongoose');

const MobileSchema = new mongoose.Schema({
    marca: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    almacenamiento: {
        type: String,
        required: false,
    },ram: {
        type: String,
    },
    bateria:{
        type: String,
        default: ""
    }, 
    estado: {
        type: String,
        enum: ['nuevo', 'usado', 'roto'],
        required: false
    },
    brokenParts: {
        type: [ {
            type: String,
            enum: ['frontScreen', 'backScreen', 'frontCamera', 'faceId', 'backCamera', 'button', 'speakers', 'battery', 'chargingPort', 'microphone', 'simTray']
        }],
        required: function() {
            return this.status === 'broken';
        }
    }
});

const MobileArticle = BaseArticle.discriminator('Mobile', MobileSchema);

module.exports = MobileArticle;
