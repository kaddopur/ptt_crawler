const axios = require('axios');
const cheerio = require('cheerio');
const stringify = require('csv-stringify');
const fs = require('fs');

const PTT_PREFIX = 'https://www.ptt.cc';
const TASK_INTERVAL = 1000;

let lastCheck = new Date('1990-01-01');

function processCaseOne(title, url) {
    axios.get(PTT_PREFIX + url).then(response => {
        const data = response.data;
        const $ = cheerio.load(data);
        const datetimeSelector = '.article-meta-value';
        const datetime = new Date(
            $(datetimeSelector)
                .last()
                .text()
        );

        // dedupe using datetime
        if (datetime - lastCheck <= 0) {
            return;
        } else {
            lastCheck = datetime;
        }

        stringify(
            [
                {
                    title,
                    datetime: datetime.toISOString()
                }
            ],
            {},
            (err, output) => {
                console.log('TCL: processCaseOne -> output', output);
                fs.writeFileSync('taobao.csv', output, { flag: 'a' });
            }
        );
    });

    // dedupe
}

function main(pageNumber) {
    console.log('TCL: main -> pageNumber', pageNumber);
    axios
        .get(`https://www.ptt.cc/bbs/e-shopping/index${pageNumber}.html`)
        .then(response => {
            const data = response.data;
            const $ = cheerio.load(data);
            const titleLinkSelector = '.r-ent .title a';

            $(titleLinkSelector).each((index, element) => {
                const $ele = $(element);
                const title = $ele.text();
                const url = $ele.attr('href');

                if (title.indexOf('公告') >= 0) {
                    return;
                }

                if (title.indexOf('淘寶') < 0) {
                    return;
                }

                processCaseOne(title, url);
            });
        });
}

// let pageNumber = 3448;
let pageNumber = 3481;

setInterval(() => {
    main(pageNumber);
    pageNumber++;
}, TASK_INTERVAL);
