const http = require('http')
const readline = require('readline');
const nodemailer = require('nodemailer');
const _ = require('lodash');

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
            items = _.map(JSON.parse(data).findItemsByKeywordsResponse[0].searchResult[0].item, (item) => {
                let itemText = 'Item name: ' +
                    item.title + '\n' +
                    'Current price: ' + item.sellingStatus[0].currentPrice[0]['@currencyId'] + ' ' + item.sellingStatus[0].currentPrice[0].__value__ + '\n' +
                    'Item URL: ' + item.viewItemURL + '\n' +
                    'Location: ' + item.location;

                return itemText;

            });

            sendAlert(items);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function sendAlert(items) {
    const transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EBAYALERTSEMAIL,
            pass: process.env.EBAYALERTSPW,
        },
    });

    let msg = '';

    items.forEach((item) => {
        msg += item + '\n\n';
    });

    const mailOptions = {
        from: process.env.EBAYALERTSEMAIL,
        to: process.env.EBAYALERTSDEST,
        subject: 'ebay Alert',
        text: msg
    };

    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        console.log(`Message sent: ${info.response}`);
    });
}