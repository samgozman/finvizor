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
            companyLink = $('h2.quote-header_ticker-wrapper_company > a'),
            headerCategories = $('div.quote-header_categories > a.quote-header_category'),
            mainTable = $('.content div.screener_snapshot-table-wrapper > table > tbody').find('tr'),
            insidersTable = $('tr.fv-insider-row');

        // Header categories are screener links like 'screener?v=111&f=sec_technology',
        // matched by filter prefix since their position varies (e.g. market cap link is optional)
        const headerCategory = (filter: string): string =>
            headerCategories
                .filter((i, a) => ($(a).attr('href') ?? '').includes(`f=${filter}_`))
                .first()
                .text()
                .trim();

        // Parse non tabular data
        let stock: TempObject = {
            ticker: $('h1.quote-header_ticker-wrapper_ticker').text().replace(/-/g, '.'),
            name: companyLink.text().trim(),
            site: companyLink.attr('href'),
            exchange: headerCategory('exch').replace(/[^a-zA-Z]+/g, ''),
            sector: headerCategory('sec'),
            industry: headerCategory('ind'),
            country: headerCategory('geo'),
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

        // 🩼 map merged and renamed snapshot rows back to the Stock schema 🩼
        const lastWord = (value: string): string => value.trim().split(/\s+/).pop() as string;
        // '6.89% 17.91%' => '17.91%' (3Y and 5Y values in one row)
        // '348.15 -1.01%' => '-1.01%' (52W price and distance from it in one row)
        const lastWordRows: Record<string, string> = {
            'EPS past 3/5Y': 'EPS past 5Y',
            'Sales past 3/5Y': 'Sales past 5Y',
            '52W High': '52W High',
            '52W Low': '52W Low',
        };
        Object.entries(lastWordRows).forEach(([from, to]) => {
            if (stock[from] !== undefined) {
                const value = lastWord(stock[from]);
                delete stock[from];
                stock[to] = value;
            }
        });
        // 'Yes / No' => Optionable: 'Yes', Shortable: 'No'
        if (stock['Option/Short'] !== undefined) {
            const [optionable, shortable] = (stock['Option/Short'] as string).split('/');
            stock['Optionable'] = optionable.trim();
            stock['Shortable'] = (shortable ?? '').trim();
            delete stock['Option/Short'];
        }
        const renamedRows: Record<string, string> = {
            'Change %': 'Change',
            // Finviz replaced ROI with ROIC
            ROIC: 'ROI',
        };
        Object.entries(renamedRows).forEach(([from, to]) => {
            if (stock[from] !== undefined) {
                stock[to] = stock[from];
                delete stock[from];
            }
        });

        stock = fixKeys(stock);
        stock = fixValues(stock);

        // Create insiderDeals array
        stock.insidersDeals = [];

        for (let i = 0; i < insidersTable.length; i++) {
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
