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
    let url = [
        'https://www.theverge.com/2019/12/5/20995453/away-luggage-ceo-steph-korey-toxic-work-environment-travel-inclusion',
        'https://www.theverge.com/2019/12/4/20994361/google-alphabet-larry-page-sergey-brin-sundar-pichai-co-founders-ceo-timeline'
    ];


    for (let i = 0; i < url.length; i++) {
        let startOfWww = url[i].indexOf('www');
        let endOfWww = startOfWww + 4;
        let startOfDotCom = url[i].indexOf('.com');
        let siteName = url[i].substring(endOfWww, startOfDotCom);

        const page = await browser.newPage();

        await page.goto(url[i]);

        // Still need  to find the title, is working out-of-the-box
        let rawTitle = await page.$eval('title', element => element.textContent);

        let title = '';

        if (rawTitle) {
            title = rawTitle.toLowerCase().replace(/ /g,"_");
        }

        const bodyHtml = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(bodyHtml);

        let textContainer = $('.c-entry-content').text();
        let removeWhiteSpace = textContainer.replace(/^\s*[\r\n]/gm, "\r\n");

        let data = siteName + "\r\n" + "\r\n" + title + "\r\n" + removeWhiteSpace;


        // Check if a directory for the scrapped site already exists. If not, create it.
        if (!fs.existsSync('./scrappedArticles/' + siteName)){
            fs.mkdirSync('./scrappedArticles/' + siteName);
        }

        // Create file with title as name. Insert website name, article title, and article body
        fs.writeFile("./scrappedArticles/" + siteName + "/" + title + '.txt', data, (err) => {
            if (err) {
                return console.log('an error happened while saving the file', err);
            }
            console.log('file saved successfully!');
        });


    }
    await browser.close();
})();
