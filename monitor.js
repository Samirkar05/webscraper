const GPT_Serialize_Multiple_MobileArticles = require("./aiSerialising.js")
const webscrape = require("./webscrape.js")

//Database requires
const { BaseArticle, MobileArticle, ElectricScooterArticle } = require('./models');
const connectDB = require('./db');
const mongoose = require('mongoose')

const MAX_CAP =3
async function unpackData(data, processor){
    const details = await processor(data);
    const processedData = []
    for (const i in details){ //maybe not all data was processed, there might be a cap over open api requests
        processedData.push({...data[i],...details[i]})
    }
    console.log("Data unpacked")
    return processedData
}

async function manageSaveMobileArticle(sessionInfo){
    await MobileArticle.create(sessionInfo.data);
    const mobiles = sessionInfo.data
    const allMobilePrices = [];
    for (const i in mobiles){
        if (i == MAX_CAP){
            break
        }
        const mobile = mobiles[i]
        sessionInfo = await webscrape.scrapeBlackmarket(sessionInfo,mobile.nombre)
        const blackMarketData = sessionInfo.data
        for (const j in blackMarketData){
            const data = blackMarketData[j]
            console.log(data)
            const productPrice = {
                name: mobile.nombre,
                brand: mobile.marca,
                currentPrice: data.priceRange[0],
                storage: data.storage
            }
            allMobilePrices.push(productPrice)
        }
    }
    const {data:_, ...rest} = sessionInfo
    return {data: allMobilePrices, ...rest}

}

(async () =>{
    await connectDB();
    let sessionInfo = await webscrape.initiateSession()

    sessionInfo = await webscrape.searchMilanuncios(sessionInfo, "Iphone X")
    
    sessionInfo = await webscrape.iterPageMilanuncios(sessionInfo)
    console.log(sessionInfo.data)
    sessionInfo.data = await unpackData(sessionInfo.data, GPT_Serialize_Multiple_MobileArticles)
    console.log(sessionInfo.data)
    // sessionInfo = await webscrape.scrapeBlackmarket(sessionInfo, "Iphone X")
    // console.log(sessionInfo.data)
    console.log("Going to new func")
    sessionInfo = await manageSaveMobileArticle(sessionInfo)
    console.log(sessionInfo.data)
    // sessionInfo = await scrapeBlackmarket(sessionInfo,"Iphone 7")
})();

