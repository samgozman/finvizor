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
            headersTable = $('.content table.fullview-title > tbody'),
            mainTable = $('.content div.snapshot-table-wrapper > table > tbody').find('tr'),
            insidersTable = $(
                '.content .ticker-wrapper > div.fv-container > table > tbody > tr > td > div > table:nth-child(2) > tbody > tr:nth-child(13) > td > table > tbody'
            ).find('tr');

        // Parse non tabular data
        let stock: TempObject = {
            ticker: $('#ticker').text().replace(/-/g, '.'),
            name: $(headersTable).find('tr:nth-child(2) > td > a > b').text(),
            site: $(headersTable).find('tr:nth-child(2) > td > a').attr('href'),
            exchange: $('#ticker')
                .next()
                .text()
                .replace(/[^a-zA-Z]+/g, ''),
            sector: $(headersTable).find('tr:nth-child(3) > td > a:nth-child(1)').text(),
            industry: $(headersTable).find('tr:nth-child(3) > td > a:nth-child(2)').text(),
            country: $(headersTable).find('tr:nth-child(3) > td > a:nth-child(3)').text(),
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

            // 🩼 crutch injection 🩼
            if (stock['Short Float / Ratio']) {
                const sfrVal = (stock['Short Float / Ratio'] as String).split(' / ');
                stock['Short Float'] = sfrVal[0];
                stock['Short Ratio'] = sfrVal[1];
                delete stock['Short Float / Ratio'];
            }
        });

        stock = fixKeys(stock);
        stock = fixValues(stock);

        // Create insiderDeals array
        stock.insidersDeals = [];

        // Note: 1 to skip header
        for (let i = 1; i < insidersTable.length; i++) {
            const line = insidersTable[i];
            const elements = $(line).find('td');
            let insObj: Insider = {
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
    } catch (error) {
        throw new Error(String(error));
    }
};
