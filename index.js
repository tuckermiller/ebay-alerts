const http = require('http')
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your search keywords separated by space\n', (answer) => {
    executeSearch(answer);
    rl.close();
});

function executeSearch(keywords) {
    let baseUrl = 'http://svcs.sandbox.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=' + process.env.APPID + '&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD';
    baseUrl += '&keywords=' + encodeURIComponent(keywords);

    let items;

    http.get(baseUrl, (res) => {
        let data = '';

        // A chunk of data has been recieved.
        res.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        res.on('end', () => {
            items = JSON.parse(data).findItemsByKeywordsResponse[0].searchResult;
            console.log(items)
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}