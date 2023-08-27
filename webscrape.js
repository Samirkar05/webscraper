const puppeteer = require('puppeteer-extra') 
 
// Add stealth plugin and use defaults 
const pluginStealth = require('puppeteer-extra-plugin-stealth') 
const {executablePath, Page} = require('puppeteer');

//Custom imports
const custom_websites = require("./websites.js")


puppeteer.use(pluginStealth()) 
const MAX_TIMEOUT = 60000 * 5

async function openBrowser(){
    return await puppeteer.launch({
        headless:false,
        executablePath: executablePath(),
        slowMo: 300
    })
}


async function executeCookies(page, tag){
    const acceptCookiesElement = await page.waitForSelector(tag)
    await acceptCookiesElement.click()
    console.log("Cookies accepted successfully.")
}


async function acceptCookies(page, website){
    await executeCookies(page, website.cookies.acceptCookiesButtonTag)
}

async function autoScroll(page){
    await page.evaluate(async () =>{
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 300;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
    
                if(document.documentElement.scrollTop >= scrollHeight - window.innerHeight- 1000){
                    clearInterval(timer);
                    resolve();
                }
            }, 600);
        });
    })
}

async function getURLs(page, website){
    const info = await page.evaluate((website) =>{
        const cardNodes = document.querySelectorAll(website.navigation.cardTag);
        const postList = [...cardNodes].map((card)=>{
            const url = card.querySelector(website.navigation.postTag).getAttribute("href")
            return new URL(url, window.location.href).href;
        })
        return postList
    }, website)
    return info
}
async function getProperties(page, website) {
    return await page.evaluate((tags) => {
        const statusElement = document.querySelector(tags.statusTag);
        const status = statusElement ? statusElement.textContent : "NotFound";
        
        const titleElement = document.querySelector(tags.titleTag);
        const title = titleElement ? titleElement.textContent : "NotFound";

        const descriptionElement = document.querySelector(tags.descriptionTag);
        const description = descriptionElement ? descriptionElement.textContent : "NotFound";

        const priceElement = document.querySelector(tags.priceTag);
        const price = priceElement ? priceElement.textContent : "NotFound";

        const locationElement = document.querySelector(tags.locationTag);
        const location = locationElement ? locationElement.textContent : "NotFound";
        
        const publicationElement = document.querySelector(tags.publicationTag);
        const publication = publicationElement ? publicationElement.textContent : "NotFound";
        
        const lastEditedElement = document.querySelector(tags.lastEditedTag);
        const lastEdited = lastEditedElement ? lastEditedElement.textContent : "NotFound";
        
        let isShippable = false;
        if (document.querySelector(tags.isShippableTag)) {
            isShippable = true;
        }

        const img = document.querySelectorAll(tags.imagesTag);
        const imageUrl = [];
        [...img].map((img) => imageUrl.push(img.getAttribute("src")));

        return {
            title: title,
            description: description,
            price: price,
            location: location,
            status: status,
            publication: publication,
            lastEdited: lastEdited,
            isShippable: isShippable,
            images: imageUrl
        }
        
    }, website.extractInfo);  // Pasamos el objeto de etiquetas 'extractInfo' como parámetro a la función evaluate.
}

const chunkList = (arr, n) => {
    const size = Math.ceil(arr.length / n);
    return Array.from({ length: n }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  }

async function diversifyBrowsing(browser, urls,numBifurcations, callback){
    // Instruction: The function requires a list of posts with an url attribute
    const url_packages = chunkList(urls, numBifurcations);

    try {
        const result = []
         const explorersPromises = url_packages.map(async (url_package, k) => {
            const branch_number = k;
            console.log("\(Branch", branch_number,"\):", "Initiated exploration.")
            const page = await browser.newPage();

            for (const i in url_package){
                const post = url_package[i]

                await page.goto(post, { timeout: MAX_TIMEOUT })
                const data = await callback(page, post);
                result.push(data) //Callback has to return some values

                console.log("\(Branch", k,"\):", Number(i) + 1,"/",url_package.length,"posts processed.")
            }
            console.log("\(Branch", k,"\):", "Finished.")

            page.close()
            
        });
    
        await Promise.all(explorersPromises);
        return result;

      } catch (error) {
        console.error('Error:', error); 
      }

}

async function nextPage(page, website){
    console.log("About to go to next page...")
    const nextBtn = await page.waitForSelector(website.navigation.nextPageButtonTag)
    await Promise.all([
        page.waitForNavigation({timeout: MAX_TIMEOUT}),
        nextBtn.click()
      ]);   
    console.log("On next page.")
}

async function cycle(page, website){
    await autoScroll(page)
    return await getURLs(page,website)
}



async function getAllElements(page, tag){
    //Needs to have INDEX inside to replace for the actual number
    let foundings = [];
    let i = 0;
    while (true) {
        const selector = tag.replace("INDEX", String(i))
        const element = await page.$(selector);
        
        if (element) {
            const text = await page.$eval(selector, el => el.textContent.trim());
            foundings.push(text);
            i++;
        } else {
            break;  // Exit the loop if the element is not found
        }
    }
    return foundings;
}
async function  scrapeBlackmarket(sessionInfo, mobile){
    console.log("Going to blackmarket")
    const {browser,allPages} = sessionInfo
    const page_url = allPages.blackmarket.page.url()
    const page = await browser.newPage()
    await page.goto(page_url)

    const blackmarket = allPages.blackmarket

    // Input mobile name in search bar and search
    await page.type(blackmarket.search.searchBarTag, mobile);
    await page.click(blackmarket.search.searchButtonTag);
    
    // Wait for the results to load
    await page.waitForSelector(blackmarket.itemFinding.itemCardTag);
    await page.click(blackmarket.itemFinding.itemCardTag);  

    const data = []
    const storagesAvailable = await getAllElements(page, blackmarket.itemFinding.storageBaseTag)
    for (const i in storagesAvailable){
        await page.click(blackmarket.itemFinding.storageBaseTag.replace("INDEX", String(i)))
        const prices = await getAllElements(page,blackmarket.itemFinding.pricesTag)
        data.push({storage: storagesAvailable[i], priceRange: prices})
    }
    let {data: _, ...rest}= sessionInfo
    await page.close()
    return {data, ...rest}
}

async function searchMilanuncios(sessionInfo, item){
    //Initialise Milanuncios with product in mind
    const {allPages} = sessionInfo
    const website = allPages.milanuncios
    const page = website.page

    console.log("Selecting search-bar")
    await page.type(website.search.searchBarTag, item);
    console.log("Going to click")
    await page.click(website.search.searchButtonTag);
    return sessionInfo
}

async function iterPageMilanuncios(sessionInfo){
    // Begin scraping that product
    const {browser,allPages} = sessionInfo
    const website = allPages.milanuncios
    
    const lote = await cycle(website.page, website)
    console.log("Got", lote.length, "posts.")


    const data = await diversifyBrowsing(browser, lote, 4, async (thisPage, post) =>{
        const desc = await getProperties(thisPage, website)
        return {url: post, ...desc, sourceWebsite: "Milanuncios"}
    })
    await nextPage(website.page, website)
    return {data, ...sessionInfo}
}
async function startWebsites(browser,website){
    const page = await browser.newPage()
    await page.goto(website.url)
    await acceptCookies(page, website)
    return page
}

async function initiateSession(){
    const browser = await openBrowser()
    let allPages = {};
    for (let siteKey in custom_websites){
        const page = await startWebsites(browser, custom_websites[siteKey])
        const webName = custom_websites[siteKey].name
        allPages = {...allPages, [webName]:{...custom_websites[siteKey], page: page} }
    }
    return {browser, allPages}
}


// (async () => {
//     // await connectDB();
//     // const page = await searchMilanuncios(custom_websites.milanuncios, "Iphone X")
//     // const articles = await iterPageMilanuncios(browser,custom_websites.milanuncios,page) 
//     // console.log("Entering processing")
//     // const processed_data  = await GPT_Serialize_Multiple_MobileArticles(articles)
//     // const data = []
//     // for (const i in processed_data){
//     //     data.push({...articles[i],...processed_data[i]})
//     // }
//     // console.log("Saving in database")
//     // // await scrapeBlackmarket(browser,custom_websites.blackmarket,"Iphone X")
//     // await MobileArticle.create(data);
//     // await browser.close();

//     let sessionInfo = await initiateSession()
//     sessionInfo = await searchMilanuncios(sessionInfo, "Iphone")
//     sessionInfo = await iterPageMilanuncios(sessionInfo)
//     console.log(sessionInfo.allPages.milanuncios.page.url())
//     sessionInfo = await scrapeBlackmarket(sessionInfo,"Iphone 7")
//     console.log(sessionInfo.data)
// })();
module.exports = {initiateSession, 
    searchMilanuncios,
    iterPageMilanuncios,
    scrapeBlackmarket}