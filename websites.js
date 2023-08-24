const websites = {
    blackmarket :{
        name: "blackmarket",
        url: "https://www.backmarket.es/",
        cookies:{
            acceptCookiesButtonTag: 'button[data-qa="accept-cta"]'
        },
        search:{
            searchBarTag: 'input[data-qa="search-bar-input"]',
            searchButtonTag: 'button[aria-label="Search"]'
        },
        itemFinding:{
            itemCardTag: ".productCard",
            storageBaseTag: `[data-qa='storage-INDEX']`,
            pricesTag : '[data-qa="grades-INDEX"] a div div:last-child'
        },
    },
    milanuncios :{
        name: "milanuncios",
        url: "https://www.milanuncios.com/",
        cookies: {
            acceptCookiesButtonTag: 'button[data-testid="TcfAccept"]'
        },
        search: {
            searchBarTag: '#form-search-suggester-input',
            searchButtonTag: '.ma-FormHome-submitButton'
        },
        extractInfo:{
            titleTag: "h1",
            descriptionTag:".ma-AdDetail-description",
            priceTag: ".ma-AdPrice-value",
            locationTag:".ma-AdLocation",

            publicationTag: ".ma-AdStatistics-date p",
            lastEditedTag: ".ma-AdStatistics-date p:last-child",
            isShippableTag: ".ma-ContentAdDetail-ShippableText-shippableTextContainer",
            statusTag: ".ma-AdAttributes-item p:last-child",
            imagesTag: ".ma-SharedSlider-slide picture img",
        },
        navigation:{
            nextPageButtonTag: ".sui-MoleculePagination li:last-child",
            cardTag: ".ma-AdCardV2",
            postTag: ".ma-AdCardListingV2-TitleLink"
        }
    }
}
module.exports =  websites