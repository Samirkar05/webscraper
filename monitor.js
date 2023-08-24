const GPT_Serialize_Multiple_MobileArticles = require("./aiSerialising.js")
const webscrape = require("./webscrape.js")

//Database requires
const { BaseArticle, MobileArticle, ElectricScooterArticle } = require('./models');
const connectDB = require('./db');
const mongoose = require('mongoose')


async function processData(data, processor){
    const details = await processor(data);
    const processedData = []
    for (const i in details){ //maybe not all data was processed, there might be a cap over open api requests
        processedData.push({...data[i],...details[i]})
    }
    return processedData
}
async function manageSaveMobileArticle(sessionInfo,data){
    await MobileArticle.create(data);
    for (const i in data){
        webscrape.scrapeBlackmarket(sessionInfo,data[i])
    }
}

(async () =>{
    await connectDB();
    let sessionInfo = await webscrape.initiateSession()

    sessionInfo = await webscrape.searchMilanuncios(sessionInfo, "Iphone")
    sessionInfo = await webscrape.iterPageMilanuncios(sessionInfo)
    sessionInfo.data = await processData(sessionInfo.data, GPT_Serialize_Multiple_MobileArticles)

    
    // sessionInfo = await scrapeBlackmarket(sessionInfo,"Iphone 7")
})();

