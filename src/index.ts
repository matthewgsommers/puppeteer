import * as json2csv from 'json2csv';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import gmailSend from 'gmail-send';
import path from 'path';
// Typescript
// app.tsimport data from './example.json';
// const word = (<any>data).name;
// console.log(word); // output 'testing'

// @TODO: Change flow of app. User inputs the site URL, go to homepage, create array of all <a> tags, visit all tags in
// the array, collect all of the articles.

let storageDirectoryName = 'storageDirectory';
let filePathArray : string[] = [];

function getAllFiles() {
    fs.readdir('storageDirectory/economist', function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            console.log(file);
            filePathArray.push(file);
        });
    });
    console.log(filePathArray);
}

function createStorageDirectory(storageDirectory, directoryName) {
    let filePath = './' + directoryName;
    if (!fs.existsSync(filePath)){filePathArray
        fs.mkdirSync(filePath);
    } else {
        // Do nothing
    }
}

function createPublisherDirectory(storageDirectory, directoryName) {
    let filePath = './' + storageDirectory + '/' + directoryName;
    if (!fs.existsSync(filePath)){
        fs.mkdirSync(filePath);
    } else {
        // Do nothing
    }
}

function getSiteName(url) {
    // @TODO: Account for non .com URLs
    let endOfWww = url.indexOf('www') + 4;
    let startOfDotCom = url.indexOf('.com');
    let siteName = url.substring(endOfWww, startOfDotCom);
    return siteName
}

function formatString(string) {
    let formattedString = string.toLowerCase().replace(/ /g,"-");
    return formattedString;
}

function sendEmail() {
    console.log('comig from send email');
    console.log(filePathArray);
    let fileArray =  [
        'storageDirectory/economist/big-tech---how-to-make-sense-of-the-latest-tech-surge-|-leaders-|-the-economist.txt',
        'storageDirectory/economist/test.txt'
    ]
    const send = require('gmail-send')({
        user: '',
        pass: '',
        to:   '',
        subject: 'this is a test',
        body: 'emailBody',
        files: [ filePathArray ]
    });

    // files: [ filePathArray ],
    // @TODO: Ge the path of all files that have been created.
    send({
        text: 'gmail-send example 1',
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
                'https://www.economist.com/leaders/2020/02/20/how-to-make-sense-of-the-latest-tech-surge',
                'https://www.economist.com/briefing/2020/03/12/understanding-sars-cov-2-and-the-drugs-that-might-lessen-its-power'
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


                // @TODO: Use data object to set the regex dynamically depending on what url is passed in
                // @TODO: Figure out a way to format text so that its broken into paragraphs
                let body = $('.article__body-text').text().replace(/^\s*[\r\n]/gm, "\r\n");
                // /(.{80})/g
                let siteName = getSiteName(url[i]);
                await createPublisherDirectory(storageDirectoryName, siteName);

                // Concat all relevant data points into one variable
                let data = siteName + "\r\n" + "\r\n" + title + "\r\n" + body;
                let filePath = "./" + storageDirectoryName + "/" + siteName + "/" + title + '.txt';

                // @TODO: Replace with a function to create the paths instead of doing it here
                filePathArray.push(filePath);
                // Create file with title as name. Insert website name, article title, and article body
                fs.writeFile(filePath, data, (err) => {
                    if (err) {
                        return console.log('an error happened while saving the file', err);
                    }
                    // Do nothing
                });
            }
            await browser.close();
        })()
   } catch {
       console.log('Puppeteer has failed. See logs for errors.');
   }
};

async function initiateScrape() {
    await createStorageDirectory(storageDirectoryName, 'storageDirectory' );
    await launchPuppetter();
    await getAllFiles();
    await sendEmail();
}

initiateScrape();