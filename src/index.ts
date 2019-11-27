import * as json2csv from 'json2csv';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';


(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('http://pizza.com');

    // Search by element
    const title = await page.$eval('title', element => element.textContent);

    console.log('title', title);

    // Search by class
    const homeButton = await page.$eval('.home_link', element => element.textContent);;

    console.log('Home button', homeButton);

    // Search by class and child
    const topNavButtons = await page.$eval('.word-only li', element => element.textContent);

    console.log('top nav buttons', topNavButtons);

    // // Search by property
    const pizzaNews = await page.$eval('a[href="/pizza-news"]', element => element.textContent);

    console.log('pizza news', pizzaNews);

    // // Search by property and find only the last
    const lastNavLink = await page.$$eval('li a', elements => elements[elements.length - 1].textContent);

    console.log('last  nav link', lastNavLink);

    // // Get propery from element
    const funFactsLink = await page.$eval('.last a', element => element.getAttribute('href'));

    console.log('fun facts link', funFactsLink);

    // Get a list of all 'li a' text
    const listElements: any[] = await page.evaluate(() => Array.from(document.querySelectorAll('li a'), element => element.textContent));

    console.log('list elements', listElements);

    const data = {
        titleText: title,
        homeButtonText: homeButton,
        topNavButtonsText: topNavButtons,
        pizzaNewsText: pizzaNews,
        listElementsArray: listElements
    };

    const csv = json2csv.parse(data);

    await page.click('a[href="/pizza-news"]');
    // Wait for 3.5 seconds
    await page.waitFor(3500);

    // ...or just use cheerio
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(bodyHtml);
    console.log('pizza news type-post', $('.type-post b').text());

    fs.writeFile('data.csv', csv, (err) => {
        if (err) {
            return console.log('an error happened while saving the file', err);
        }
        console.log('file saved successfully!');
    });


    await browser.close();
})();
