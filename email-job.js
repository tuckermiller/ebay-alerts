const http = require('http')
const nodemailer = require('nodemailer');
const _ = require('lodash');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

pool.query('SELECT * FROM alerts', (err, psqlRes) => {
    if (err) {
        console.log(err);
    } else {
        if (psqlRes.rows) {
            console.log(psqlRes.rows);
            _.forEach(psqlRes.rows, (row) => {
                // To do: only send alerts according to their frequency
                sendAlert(getEbayItemsByKeyword(row.keywords), row.email);
            });
        }
    }
});

function getEbayItemsByKeyword(keywords) {
    let url = 'http://svcs.sandbox.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=' + process.env.EBAY_APPID + '&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD';
    url += '&keywords=' + encodeURIComponent(keywords);

    let items;

    http.get(url, (res) => {
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

            return (items);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function sendAlert(items, email) {
    console.log(items);
    console.log(email);
    const transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PW,
        },
    });

    let msg = '';

    items.forEach((item) => {
        msg += item + '\n\n';
    });

    const mailOptions = {
        from: process.env.EBAYALERTSEMAIL,
        to: email,
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