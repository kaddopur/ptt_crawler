const axios = require('axios');
const cheerio = require('cheerio');

const E_SHOPPING_INDEX = 'https://www.ptt.cc/bbs/e-shopping/index.html';

function parseContentPage(title, url) {}

axios.get(E_SHOPPING_INDEX).then(response => {
    const data = response.data;
    const $ = cheerio.load(data);
    const titleLinkSelector = '.r-ent .title a';

    const link = $(titleLinkSelector).each((index, element) => {
        const $ele = $(element);
        const title = $ele.text();
        const url = $ele.attr('href');

        // TODO: filter Taobao only
        parseContentPage(title, url);
    });
});
