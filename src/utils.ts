import got from 'got';
import { camelCase } from 'lodash';
import { Earnings, MarketTime } from './Earnings';
import { Stock } from './Stock';

export interface TempObject {
    [key: string]: any;
}

/**
 * Get html page for chosen quote
 * @param ticker
 * @returns {Promise<string>}
 */
export const getStockPage = async (ticker: string): Promise<string> => {
    try {
        const response = await got('https://finviz.com/quote.ashx', {
            searchParams: {
                t: ticker,
                p: 'd',
            },
        });
        return response.body;
    } catch (error) {
        return '';
    }
};

/**
 * Capitalize each first letters (for insider names)
 * @param str
 * @returns {string}
 */
export const capitalizeFirstLetters = (str: string): string => {
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
};

/**
 * Converts string date like 'Feb 25 AMC' to Date object with current year
 * @param {String} dateString - String date like 'Feb 25 AMC'
 * @returns {Earnings} Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC.
 */
const convertDate = (dateString: string): Earnings => {
    if (!dateString) {
        return {
            date: 0,
            marketTime: '',
        };
    }

    // Use only first two statements from the date string
    const dateArr = dateString.split(' '),
        currentDate = new Date(),
        date = new Date(dateArr[0] + dateArr[1]);

    // To set proper year for the past date
    if (currentDate.getMonth() - date.getMonth() < 0) {
        date.setFullYear(currentDate.getUTCFullYear() - 1);
    } else {
        date.setFullYear(currentDate.getFullYear());
    }

    return {
        date: date.valueOf(),
        marketTime: (dateArr[2] as MarketTime) || '',
    };
};

/**
 * Fix keys names
 * @param {TempObject} obj
 * @returns {Stock}
 */
export const fixKeys = (obj: TempObject): Stock => {
    let resultObj: TempObject = {};
    Object.keys(obj).forEach((key) => {
        let newKey = key;
        // 'Dividend %' => 'Dividend Percent'
        newKey = newKey.replace(/%/gi, 'Percent');
        // '52W High' => ' High52W'
        const startsWithNumber = newKey.match(/^([0-9]{2}[A-Z]{1})/gm);
        if (startsWithNumber) {
            newKey = newKey.replace(/^([0-9]{2}[A-Z]{1})/gm, '');
            newKey += startsWithNumber[0];
        }
        // 'RSI (14)' => 'RSI '
        newKey = newKey.replace(/\(.*?\)/g, '');
        // 'P/C' => 'PC', 'P/FCF' => 'P/CF' || 'EPS Q/Q' => 'EPS QQ'
        if (newKey.match(/(^[A-z]{1}\/)|(\s[A-z]{1}\/)/g)) {
            newKey = newKey.replace(/\//g, '');
        }
        // 'Debt/Eq' => 'Debt Eq'
        newKey = newKey.replace(/\//g, ' ');
        // To camel case 'Rel Volume' => 'relVolume'
        newKey = camelCase(newKey);
        resultObj[newKey] = obj[key];
    });

    return resultObj as Stock;
};

/**
 * Fix values
 * @param {TempObject} obj
 * @returns {Stock}
 */
export const fixValues = (obj: TempObject): Stock => {
    // Keys that was already processed (good to go)
    const processed = ['index', 'country', 'industry', 'sector', 'exchange', 'site', 'name', 'ticker'];

    // Keys that need separate processing (text values or dates)
    const exclusions = ['earnings', 'shortable', 'optionable'];

    // Keys that need to be processed as range values (low high)
    const range = ['range52W', 'volatility'];

    // Fix numeric values
    Object.keys(obj).forEach((key) => {
        if (!processed.includes(key) && !exclusions.includes(key) && !range.includes(key)) {
            let newValue: any = obj[key];
            // Remove whitespaces, commas and percentage characters
            newValue = newValue.replace(/[\s]|(%)|(,)|(\()|(\))/g, '');
            // Fix if value ends with B (billions) or M (millions)
            if (newValue.match(/M/g)) {
                newValue = Math.floor(+newValue.replace(/M/g, '') * 1.0e6);
            } else if (newValue.match(/B/g)) {
                newValue = Math.floor(+newValue.replace(/B/g, '') * 1.0e9);
            } else {
                newValue = +newValue;
            }

            obj[key] = newValue || null;
        } else {
            // Fix boolean values
            obj[key] = obj[key] === 'Yes' ? true : obj[key];
            obj[key] = obj[key] === 'No' ? false : obj[key];
        }
    });

    // Fix range values for volatility: '1.57% 2.63%' => { week: 1.57, month: 2.63 }
    //              and for range52W: '53.15 - 145.09' => { low: 53.15, high: 145.09 }
    range.forEach((k) => {
        // Remove '- ' and %
        const rangeArr = obj[k].replace(/(%)|(-\s)/g, '').split(' ');

        if (k === 'volatility') {
            obj[k] = {
                week: +rangeArr[0],
                month: +rangeArr[1],
            };
        } else {
            obj[k] = {
                low: +rangeArr[0],
                high: +rangeArr[1],
            };
        }
    });

    // Fix index if null
    obj.index = obj.index === '-' ? undefined : obj.index;

    // Fix earning date value
    obj.earnings = convertDate(obj.earnings);

    return obj as Stock;
};
