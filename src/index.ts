import * as json2csv from 'json2csv';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import gmailSend from 'gmail-send';

// Typescript
// app.tsimport data from './example.json';
// const word = (<any>data).name;
// console.log(word); // output 'testing'

let storageDirectoryName = 'storageDirectory';

function createStorageDirectory(storageDirectory, directoryName) {
    if (!fs.existsSync('./' + directoryName)){
        fs.mkdirSync('./' + storageDirectory);
        console.log('/' + storageDirectory + ' Has Been Created');
    } else {
        console.log( storageDirectory + ' Directory Exists Already');
    }
}

function createPublisherDirectory(storageDirectory, directoryName) {
    if (!fs.existsSync('./' + storageDirectory +'/' + directoryName)){
        fs.mkdirSync('./' + storageDirectory + '/' + directoryName);
        console.log('./' + storageDirectory + directoryName + ' Has Been Created');
    } else {
        console.log('./' + storageDirectory + directoryName + ' Directory Exists Already');
    }
}

function getSiteName(url) {
    let endOfWww = url.indexOf('www') + 4;
    // @TODO: Account for non .com URLs
    let startOfDotCom = url.indexOf('.com');
    return url.substring(endOfWww, startOfDotCom);
}

function formatString(string) {
    let formattedString = string.toLowerCase().replace(/ /g,"-");
    return formattedString;
}

function sendEmail() {
    const send = require('gmail-send')({
        user: '',
        pass: '',
        to:   '',
        subject: 'this is a test',
        body: 'emailBody',
    });
    send({
        text:    'gmail-send example 1',
        },
        (error, result, fullResult) => {
            if (error) console.error(error);
            console.log(result);
        })
}

function launchPuppetter() {
   try {
        (async () => {

            let browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--incognito',
                ],
            });

            let url = [
                'https://www.economist.com/leaders/2020/02/20/how-to-make-sense-of-the-latest-tech-surge'
            ];

            for (let i = 0; i < url.length; i++) {
                const context = await browser.createIncognitoBrowserContext();
                const page = await context.newPage();

                await page.goto(url[i], { waitUntil: 'domcontentloaded' });
                await page.evaluate( () => { debugger; } );

                // Get Article title
                let rawTitle = await page.$eval('title', element => element.textContent);
                let title = formatString(rawTitle);

                // Get body HTML
                let bodyHtml = await page.evaluate(() => document.body.innerHTML);

                // Init cheerio
                let $ = cheerio.load(bodyHtml);

                let body = $('.article__body-text').text().replace(/^\s*[\r\n]/gm, "\r\n");
                // /(.{80})/g

                let siteName = getSiteName(url[i]);
                createPublisherDirectory(storageDirectoryName, siteName);

                // Concat all relevant data points into one variable
                let data = siteName + "\r\n" + "\r\n" + title + "\r\n" + body;

                // Create file with title as name. Insert website name, article title, and article body
                fs.writeFile("./" + storageDirectoryName + "/" + siteName + "/" + title + '.txt', data, (err) => {
                    if (err) {
                        return console.log('an error happened while saving the file', err);
                    }
                    console.log('file saved successfully!' + "\r\n");
                });
            }
            await browser.close();
        })()
   } catch {
       console.log('Puppeteer has failed. See logs for errors.');
   }
};

function initiateScrape() {
    createStorageDirectory(storageDirectoryName, 'storageDirectory' );
    launchPuppetter();
    sendEmail();
}

initiateScrape();