const OpenAI = require('openai');
const retry = require('retry');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.API_KEY, // defaults to process.env["API_KEY"]
  });

async function exponentialBackoff(callback){
    const retryOptions = {
        retries: 5,
        factor: 2,
        minTimeout: 10000,
        maxTimeout: 60000,
        randomize: true,
      };

    const operation = retry.operation(retryOptions);

    for (let attempt = 1; attempt <= retryOptions.retries + 1; attempt++) {
        try {
            const response = await callback();
            return response; 
        } catch (error) {
            if (attempt === retryOptions.retries + 1) { 
                throw error; 
            }
        const timeout = operation._timeouts[attempt - 1]; 
        console.log(`Attempt ${attempt} failed. Retrying in ${timeout}ms...`);
        await new Promise((resolve) => setTimeout(resolve, timeout)); 
        }
    }
};

async function sendGPTRequest(message){
    return await exponentialBackoff(async () =>{
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: message}],
            model: 'gpt-3.5-turbo',
        });
        return [completion.choices, completion.usage]
    })
}

async function GPT_Serialize_MobileArticle(title,description) {
    const message = "Imagínate que eres un trabajador experto en una fábrica de móviles. Te dan un móvil y debes de rellenar los campos: marca (apple, huawei, samsung...), nombre, almacenamiento, vida de la batería (bateria en el json) y estado del poducto (elige entre 'nuevo', 'usado' o 'roto') (estado en el json). En aquellos campos que no se puedan intuir escribe ''. La respuesta deberá ser un objeto JSON. Aquí está el producto: " + title + " y su descripción es:" + description
    // const broken = "Si está roto, selecciona cuáles de los siguientes componentes estan dañados debido a la rotura que se especifica: 'frontScreen', 'backScreen', 'frontCamera', 'faceId', 'backCamera', 'button', 'speakers', 'battery', 'chargingPort' o 'microphone', y devuelve una lista con estos, que la lista se llame brokenParts."
    
    return await sendGPTRequest(message);
}

function getJSON(string){
    try {
        return JSON.parse(string);
    } catch (error) {
        return console.error('Error parsing JSON:', error);
    }
}

async function GPT_Serialize_Multiple_MobileArticles(articles){
    const processed_data = []
    const MAX_ARTICLES = 3;
    for (const i in articles){
        if (i == MAX_ARTICLES){
            console.log("MAX established, got it.")
            break
        }
        const currentArticle= articles[i]
        const req = await GPT_Serialize_MobileArticle(currentArticle.title,currentArticle.description)
        console.log(req[1])
        processed_data.push(getJSON(req[0][0].message.content))
        console.log("Processed ", Number(i)+1, "/", articles.length,"articles.")
    }
    console.log("Serialisation finished.")
    return processed_data
}
module.exports = GPT_Serialize_Multiple_MobileArticles