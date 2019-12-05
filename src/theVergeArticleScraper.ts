import * as json2csv from 'json2csv';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';


// Scrapes all content from the URL below.

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--incognito',
        ],
    });
    const page = await browser.newPage();

    await page.goto('https://www.theverge.com/2019/12/5/20995453/away-luggage-ceo-steph-korey-toxic-work-environment-travel-inclusion');

    // Still need  to find the title, is working out-of-the-box
    const title = await page.$eval('title', element => element.textContent);

    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(bodyHtml);

    let textContainer = $('.c-entry-content').text();
    let removeWhiteSpace = textContainer.replace(/^\s*[\r\n]/gm, "\r\n");

    let data = {
        titleValue: title,
        body: removeWhiteSpace
    }

    // const data = {
        //     titleText: title,
        //     homeButtonText: homeButton,
        //     topNavButtonsText: topNavButtons,
        //     pizzaNewsText: pizzaNews,
        //     listElementsArray: listElements
        // };
    fs.writeFile('data.txt', data, (err) => {
        if (err) {
            return console.log('an error happened while saving the file', err);
        }
        console.log('file saved successfully!');
    });

    await browser.close();
})();
