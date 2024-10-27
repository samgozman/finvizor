import { load as cheerio } from 'cheerio';

import { Stock } from './Stock';
import { Insider } from './Insider';
import { capitalizeFirstLetters, fixKeys, fixValues, getStockPage, TempObject } from './utils';

export const getStock = async (ticker: string = ''): Promise<Stock | never> => {
    try {
        if (ticker === '') {
            throw new Error('No ticker provided!');
        }

        ticker = ticker.replace(/\./g, '-');

        const page = await getStockPage(ticker);

        if (page === '') {
            throw new Error('Finviz: ticker is not found or service is unavailable.');
        }

        // Select page data
        const $ = cheerio(page, null, false),
            headersTabLinks = $(
                '.content > div.ticker-wrapper > div.fv-container div.quote-links > div:nth-child(1)'
            ).find('a.tab-link'),
            mainTable = $('.content div.screener_snapshot-table-wrapper > table > tbody').find('tr'),
            insidersTable = $(
                '.content .ticker-wrapper > div.fv-container > table > tbody > tr > td > div > table:nth-child(2) > tbody > tr:last-child > td > table > tbody'
            ).find('tr');

        // Parse non tabular data
        let stock: TempObject = {
            ticker: $('h1.quote-header_ticker-wrapper_ticker').text().replace(/-/g, '.'),
            name: $('div.quote-header > div.quote-header_left > div > h2 > a').text().trim(),
            site: $('div.quote-header > div.quote-header_left > div > h2 > a').attr('href'),
            exchange: $(headersTabLinks)
                .eq(3)
                .text()
                .replace(/[^a-zA-Z]+/g, ''),
            sector: $(headersTabLinks).eq(0).text(),
            industry: $(headersTabLinks).eq(1).text(),
            country: $(headersTabLinks).eq(2).text(),
        };

        // Iterate through main financial table
        mainTable.map((i, line) => {
            const elements = $(line).find('td');
            elements.each((i, td) => {
                //          0    1    2    3
                // line => key:value:key:value etc.
                if (i % 2) {
                    // Set values
                    const key = $(elements[i - 1]).text(),
                        value = $(td).first().text();
                    stock[key] = value;
                } else {
                    // Set keys
                    const key = $(td).text();
                    stock[key] = '';
                }
            });
        });

        // 🩼 crutch injection 🩼
        if (
            stock['Dividend Est.'] !== undefined &&
            stock['Dividend Est.'] !== '' &&
            stock['Dividend Est.'] !== '-'
        ) {
            // split value like 0.99 (0.43%) to 0.99 and (0.43%)
            stock['Dividend'] = (stock['Dividend Est.'] as string).split(' ')[0];
            stock['Dividend Percent'] = (stock['Dividend Est.'] as string).split(' ')[1];
            delete stock['Dividend Est.'];
            delete stock['Dividend TTM'];
        }

        stock = fixKeys(stock);
        stock = fixValues(stock);

        // Create insiderDeals array
        stock.insidersDeals = [];

        // Note: 1 to skip header
        for (let i = 1; i < insidersTable.length; i++) {
            const line = insidersTable[i];
            const elements = $(line).find('td');
            const insObj: Insider = {
                insiderTrading: capitalizeFirstLetters($(elements[0]).text().toLowerCase()),
                insiderTradingLink: 'https://finviz.com/' + $(elements[0]).find('a').attr('href'),
                relationship: $(elements[1]).text(),
                date: $(elements[2]).text(),
                transaction: $(elements[3]).text(),
                cost: $(elements[4]).text(),
                shares: $(elements[5]).text(),
                value: $(elements[6]).text(),
                sharesTotal: $(elements[7]).text(),
                secForm4: $(elements[8]).text(),
                secForm4Link: $(elements[8]).find('a').attr('href'),
            };
            stock.insidersDeals.push(insObj);
        }

        return stock as Stock;
    } catch (error: any) {
        throw new Error(error);
    }
};
