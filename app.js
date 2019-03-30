const axios = require('axios');
const cheerio = require('cheerio');

const PTT_PREFIX = 'https://www.ptt.cc';
const E_SHOPPING_INDEX = 'https://www.ptt.cc/bbs/e-shopping/index.html';

function processCaseOne(title, url) {
    console.log('TCL: processCaseOne -> title', title);
    console.log('TCL: processCaseOne -> url', url);

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
        ).toLocaleString();

        console.log('TCL: processCaseOne -> datetime', datetime);
    });

    // dedupe
    // export csv
}

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
