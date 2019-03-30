const axios = require('axios');
const cheerio = require('cheerio');
const stringify = require('csv-stringify');
const fs = require('fs');

const PTT_PREFIX = 'https://www.ptt.cc';
const E_SHOPPING_INDEX = 'https://www.ptt.cc/bbs/e-shopping/index.html';
const TASK_INTERVAL = 3000;

let lastCheck = new Date('1990-01-01');

function processCaseOne(title, url) {
    if (title.indexOf('公告') >= 0) {
        return;
    }

    if (title.indexOf('淘寶') < 0) {
        return;
    }

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

function main() {
    axios.get(E_SHOPPING_INDEX).then(response => {
        const data = response.data;
        const $ = cheerio.load(data);
        const titleLinkSelector = '.r-ent .title a';

        $(titleLinkSelector).each((index, element) => {
            const $ele = $(element);
            const title = $ele.text();
            const url = $ele.attr('href');

            processCaseOne(title, url);
        });
    });
}

setInterval(() => {
    main();
}, TASK_INTERVAL);
