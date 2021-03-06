import { load as cheerio } from 'cheerio';

import { Stock } from './Stock';
import { Insider } from './Insider';
import { capitalizeFirstLetters, fixKeys, fixValues, getStockPage, TempObject } from './utils';

export const getStock = async (ticker: string = ''): Promise<Stock> => {
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
            headersTable = $('.content table:nth-child(1) table:nth-child(1) > tbody'),
            mainTable = $('.content table.snapshot-table2:nth-child(2) > tbody').find('tr'),
            insidersTable = $(
                '.content > .fv-container > table:nth-child(3) > tbody table.body-table > tbody'
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

        // Iterate throw main financial table
        Array.prototype.map.call(mainTable, (line) => {
            const elements = $(line).find('td');
            elements.each((i, td) => {
                //          0    1    2    3
                // line => key:value:key:value etc.
                if (i % 2) {
                    // Set values
                    const key = $(elements[i - 1]).text(),
                        value = $(td).text();

                    stock[key] = value;
                } else {
                    // Set keys
                    const key = $(td).text();
                    stock[key] = '';
                }
            });
        });

        stock = fixKeys(stock);
        stock = fixValues(stock);

        // Create insiderDeals array
        stock.insidersDeals = [];
        Array.prototype.map.call(insidersTable, (line, index) => {
            const elements = $(line).find('td');
            let insObj: Insider;
            // Setup headers
            if (index > 0) {
                insObj = {
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
        });

        return stock as Stock;
    } catch (error) {
        return {
            error: error.message,
        } as Stock;
    }
};
