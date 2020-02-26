import * as json2csv from 'json2csv';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

(async () => {


    let browser = await puppeteer.launch({
        headless: true,
        args: [
            '--incognito',
        ],
    });

    let getName = function(urlArray) {
        for (let i = 0; i < urlArray.length; i++) {
        console.log("Targeting" + urlArray[0]);
        let endOfWww = urlArray[i].indexOf('www') + 4;
        let startOfDotCom = urlArray[i].indexOf('.com');
        let siteName = urlArray[i].substring(endOfWww, startOfDotCom);
        console.log("Site name is: " + siteName);
    }




    let url = [
        'https://www.economist.com/leaders/2020/02/20/how-to-make-sense-of-the-latest-tech-surge'
    ];

    for (let i = 0; i < url.length; i++) {
        const context = await browser.createIncognitoBrowserContext();
        // implement try/catch pattern
        // Get publisher's domain name


        // Init. Puppeteer
        let page = await context.newPage();
        await page.goto(url[i], { waitUntil: 'domcontentloaded' });
        await page.evaluate( () => { debugger; } );

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
        let rawArticleBody = $('.blog-post__text p').text();

        // let formattedArticleBody = rawArticleBody.replace(/^\s*[\r\n]/gm, "\r\n");
        let formattedArticleBody = rawArticleBody.replace(/^\s*[\r\n]/gm, "\r\n");
        console.log(formattedArticleBody);
        // /(.{80})/g


        // Concat all relevant data points into one variable
        let data = siteName + "\r\n" + "\r\n" + title + "\r\n" + formattedArticleBody;

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
        });
    }
    await browser.close();
})();
