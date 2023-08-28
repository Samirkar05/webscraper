const GPT_Serialize_Multiple_MobileArticles = require("./aiSerialising.js")
const webscrape = require("./webscrape.js")

//Database requires
const { BaseArticle, MobileArticle, ElectricScooterArticle,ProductPrice,ProductPriceMobile} = require('./models');
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
async function checkNameAvailability(name){
    const ProductPriceMobile = await ProductPriceMobile.distinct("nombre")
    if (allMobileNames.includes(name)){
        return false
    } else{
        return true
    }
}
async function updatePriceByName(product){ //This requires product to have a name and a currentPrice
    const products = events ? [].concat(product) : [];
    for (const i in products){
        const prod = products[i]
        if (checkNameAvailability(prod.name)){
            await ProductPriceMobile.create(prod);
        } else{
            await ProductPrice.updateOne({name: prod.name}, {currentPrice: prod.currentPrice, lastUpdated: Date.now()})
        }
    }
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
            const productPrice = {
                name: mobile.nombre,
                brand: mobile.marca,
                currentPrice: data.priceRange[0],
                storage: data.storage
            }
            allMobilePrices.push(productPrice)
        }
    }
    await updatePriceByName(allMobilePrices)
    const {data:_, ...rest} = sessionInfo
    return {data: allMobilePrices, ...rest}

}
function checkFieldModel(field, model){
    const allFields = Object.keys(model.schema.paths)
    if (allFields.includes(field)){
        return true
    } else{
        console.log(new Error("No such field in MobileArticle"))
        return false
    }
}

async function checkMobileNames(){ //for now, only checks if all names are the same
    const allMobileNames = await MobileArticle.distinct("nombre")
    const allMobilePricesName = await ProductPriceMobile.distinct("name")

    if (allMobileNames ==! allMobilePricesName){
        //check which names are not coincident
        const notCoincidentNames = allMobileNames.filter(x => !allMobilePricesName.includes(x))
        console.log(new Error("Mobile names are not the same, missing: " + notCoincidentNames))
    }
}

async function compareMobiles(){
    if (checkFieldModel("nombre", MobileArticle)){
        checkMobileNames()
        const allMobilePricesName = await ProductPriceMobile.distinct("name")
        for(const i in allMobilePricesName){
            console.log("Comparing: " + allMobilePricesName[i])
            const mobilePrice = await ProductPriceMobile.find({name: allMobilePricesName[i]})
            
            const mobiles = await MobileArticle.find({nombre: "IPHONE X"})
            console.log(mobiles)
        }
            
    }
}



(async () =>{
    await connectDB();
    // await compareMobiles();
    let sessionInfo = await webscrape.initiateSession()

    sessionInfo = await webscrape.searchMilanuncios(sessionInfo, "Iphone 11")
    sessionInfo = await webscrape.iterPageMilanuncios(sessionInfo)
    sessionInfo.data = await unpackData(sessionInfo.data, GPT_Serialize_Multiple_MobileArticles)
    sessionInfo = await manageSaveMobileArticle(sessionInfo)
})();

