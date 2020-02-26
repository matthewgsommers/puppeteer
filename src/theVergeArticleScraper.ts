// import * as json2csv from 'json2csv';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

(async () => {
    let browser = await puppeteer.launch({
        headless: false,
        args: [
            '--incognito',
        ],
    });

    let url = [
        'https://www.theverge.com/2019/12/5/20995453/away-luggage-ceo-steph-korey-toxic-work-environment-travel-inclusion'
    ];

    for (let i = 0; i < url.length; i++) {
        // Get publisher's domain name
        let endOfWww = url[i].indexOf('www') + 4;
        let startOfDotCom = url[i].indexOf('.com');
        let siteName = url[i].substring(endOfWww, startOfDotCom);

        // Init. Puppeteer
        let page = await browser.newPage();
        await page.goto(url[i]);
        // await page.evaluate( () => { debugger; } );

        // Get Article title
        let rawTitle = await page.$eval('title', element => element.textContent);
        let title;
        if (rawTitle) {
            title = rawTitle.toLowerCase().replace(/ /g,"_");
        }

        // Get body HTML
        let bodyHtml = await page.evaluate(() => document.body.innerHTML);

        // Init cheerio
        let $ = cheerio.load(bodyHtml);

        // Target content container class
        let textContainer = $('.c-entry-content').text();

        // Replace multiple empty lines with a single empty line
        let removeWhiteSpace = textContainer.replace(/^\s*[\r\n]/gm, "\r\n");

        // Concat all relevant data points into one variable
        let data = siteName + "\r\n" + "\r\n" + title + "\r\n" + removeWhiteSpace;

        if (!fs.existsSync('./scrapedArticles')){
            fs.mkdirSync('./scrapedArticles');
        } else {
            console.log('Scraped Articles Directory Exists Already');
        }

        // Check if a directory for the scrapped site already exists. If not, create it.
        if (!fs.existsSync('./scrapedArticles/' + siteName)){
            fs.mkdirSync('./scrapedArticles/' + siteName);
        } else {
            console.log(siteName + ' Directory Exists Already');
        }

        // Create file with title as name. Insert website name, article title, and article body
        fs.writeFile("./scrapedArticles/" + siteName + "/" + title + '.txt', data, (err) => {
            if (err) {
                return console.log('an error happened while saving the file', err);
            }
            console.log('file saved successfully!' + "\r\n");
            console.log(data);
        });
    }
    await browser.close();
})();
