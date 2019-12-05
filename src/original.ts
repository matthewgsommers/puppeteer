import * as json2csv from 'json2csv';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';


// Currently

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--incognito',
        ],
    });
    const page = await browser.newPage();

    // await page.goto('https://www.economist.com/britain/2019/12/04/how-to-rehabilitate-a-terrorist');
    await page.goto('https://www.theverge.com/2019/12/5/20995453/away-luggage-ceo-steph-korey-toxic-work-environment-travel-inclusion');

    // Search by element
    const title = await page.$eval('title', element => element.textContent);

    // console.log('title', title);

    // Search by class
    // const homeButton = await page.$eval('.home_link', element => element.textContent);
    // console.log('Home button', homeButton);\

    // const container = document.getElementsByClassName('blog-post__text');

    // const nodes = document.querySelectorAll('p');
    // console.log(nodes);

    // const bodyText = await page.$eval('.blog-post__text p', element => element.textContent);
    // console.log('Home button', bodyText);

    // Search by class and child
    // const topNavButtons = await page.$eval('.word-only li', element => element.textContent);
    // console.log('top nav buttons', topNavButtons);

    // Search by property
    // const pizzaNews = await page.$eval('a[href="/pizza-news"]', element => element.textContent);
    // console.log('pizza news', pizzaNews);

    // Search by property and find only the last
    // const lastNavLink = await page.$$eval('li a', elements => elements[elements.length - 1].textContent);
    // console.log('last  nav link', lastNavLink);

    // Get propery from element
    // const funFactsLink = await page.$eval('.last a', element => element.getAttribute('href'));
    // console.log('fun facts link', funFactsLink);

    // Get a list of all 'li a' text
    // const listElements: any[] = await page.evaluate(() => Array.from(document.querySelectorAll('li a'), element => element.textContent));
    // console.log('list elements', listElements);

    // const data = {
    //     titleText: title,
    //     bodyTextContent: bodyText,
    // };

    // const data = {
    //     titleText: title,
    //     homeButtonText: homeButton,
    //     topNavButtonsText: topNavButtons,
    //     pizzaNewsText: pizzaNews,
    //     listElementsArray: listElements
    // };

    // const csv = json2csv.parse(data);

    // await page.click('a[href="/pizza-news"]');
    // Wait for 3.5 seconds
    // await page.waitFor(3500);

    // ...or just use cheerio
    // await page.evaluate('document.body.innerHTML = document.body.innerHTML');
    const container = await page.evaluate(() => document.getElementsByClassName('c-entry-content'));
    // console.log(container);

    // let myContainer = <HTMLElement> document.querySelector(".blog-post__text");
    // console.log(myContainer)
    // let childNodes = container.childNodes;
    // const childNodes =  await page.evaluate(() => container.querySelectorAll('p'));
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    // console.log(bodyHtml);
    const $ = cheerio.load(bodyHtml);
    // console.log('pizza news type-post', $('.type-post b').text());
    let containerElement = $('.c-entry-content');
    // console.log(containerElement.children());

    let textContainer = $('.c-entry-content').text();
    // let removeWhiteSpace = textContainer.replace(/ /g,'');
    let removeWhiteSpace = textContainer.replace(/^\s*[\r\n]/gm, "\r\n");
    console.log(removeWhiteSpace);






    // WORKING
    // console.log('2nd try', $('.blog-post__text p').text());

    // console.log('2nd try', $('.blog-post__text p').children());

    // for(let i = 0; i < container.length; i++){
    //     const currentNode = container[i];
    //     console.log(currentNode);
    // }
    fs.writeFile('data.txt', removeWhiteSpace, (err) => {
        if (err) {
            return console.log('an error happened while saving the file', err);
        }
        console.log('file saved successfully!');
    });


    await browser.close();
})();
