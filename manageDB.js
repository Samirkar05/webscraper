const connectDB = require('./db');
const mongoose = require("mongoose")
const { ElectricScooterArticle } = require('./models');

async function runScript() {
    try {
        // Connect to MongoDB
        await connectDB();


        await ElectricScooterArticle.create({
            name: "Iphone 7",
            title: "Hola",
            price: "35",
            url: "esta",
            description: "nose",
            location: "aqui",
            isShippable: false,
            sourceWebsite: "mi web"
        });
        
        console.log("Passed");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        // Assuming your connectDB module returns the mongoose connection
        // or you can access mongoose directly with require('mongoose')
        mongoose.connection.close();
    }
}

runScript();
