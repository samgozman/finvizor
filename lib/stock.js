const got = require('got')
const cheerio = require('cheerio')
const _ = require('lodash')

// URLs
const stockUrl = 'https://finviz.com/quote.ashx'

// Get html page for chosen quote
const getPage = async (ticker = '') => {
    try {
        const response = await got(stockUrl, {
            searchParams: {
                t: ticker
            }
        })
        return response.body
    } catch (error) {
        return ''
    }
}

/**
 * Converts string date like 'Feb 25 AMC' to Date object with current year
 * @param {String} dateString - String date like 'Feb 25 AMC'
 * @returns {Date} 
 */
const convertDate = (dateString = '') => {
    // Use only firts two statements from the date string
    const dateArr = dateString.split(' ')
    const currentDate = new Date()
    const date = new Date(dateArr[0] + dateArr[1])

    // To set proper year for the past date
    if ((currentDate.getMonth() - date.getMonth()) < 0) {
        date.setFullYear(currentDate.getUTCFullYear() - 1)
    } else {
        date.setFullYear(currentDate.getFullYear())
    }

    return date
}

// Fix keys names 
const fixKeys = (obj = {}) => {
    let resultObj = {}
    Object.keys(obj).forEach((key) => {
        let newKey = key
        // 'Dividend %' => 'Dividend Percent'
        newKey = newKey.replace(/%/gi, 'Percent')
        // '52W High' => ' High52W'
        const startsWithNumber = newKey.match(/^([0-9]{2}[A-Z]{1})/mg)
        if (startsWithNumber) {
            newKey = newKey.replace(/^([0-9]{2}[A-Z]{1})/mg, '')
            newKey += startsWithNumber[0]
        }
        // 'RSI (14)' => 'RSI '
        newKey = newKey.replace(/\(.*?\)/g, '')
        // 'P/C' => 'PC', 'P/FCF' => 'P/CF' || 'EPS Q/Q' => 'EPS QQ'
        if (newKey.match(/(^[A-z]{1}\/)|(\s[A-z]{1}\/)/g)) {
            newKey = newKey.replace(/\//g, '')
        }
        // 'Debt/Eq' => 'Debt Eq'
        newKey = newKey.replace(/\//g, ' ')
        // To camel case 'Rel Volume' => 'relVolume'
        newKey = _.camelCase(newKey)
        resultObj[newKey] = obj[key]
    })

    return resultObj
}

// Fix values
const fixValues = (obj = {}) => {
    let resultObj = {}
    // Keys that was already processed (good to go)
    const processed = [
        'index',
        'country',
        'subSector',
        'sector',
        'exchange',
        'site',
        'name',
        'ticker'
    ]

    // Keys that need separate processing (text values or dates)
    const exclusions = [
        'earnings',
        'shortable',
        'optionable'
    ]

    // Keys that need to be processed as range values (low high)
    const range = [
        'range52W',
        'volatility'
    ]

    // Fix numeric values
    Object.keys(obj).forEach((key) => {
        if (!processed.includes(key) && !exclusions.includes(key) && !range.includes(key)) {
            let newValue = obj[key]
            // Remove whitespaces, commas and percentage characters
            newValue = newValue.replace(/[\s]|(%)|(,)/g, '')
            // Fix if value ends with B (billions) or M (millions)
            if (newValue.match(/M/g)) {
                newValue = Math.floor(Number.parseFloat(newValue.replace(/M/g, '')) * 1000000)
            } else if (newValue.match(/B/g)) {
                newValue = Math.floor(Number.parseFloat(newValue.replace(/B/g, '')) * 1000000000)
            } else {
                newValue = Number.parseFloat(newValue)
            }

            obj[key] = newValue || null
        } else {
            // Fix boolean values
            obj[key] = obj[key] === 'Yes' ? true : obj[key]
            obj[key] = obj[key] === 'No' ? false : obj[key]
        }
    })

    // Fix range values '1.57% 2.63%' => { "low": 1.57, "high": 2.63 } 
    range.forEach((k) => {
        // Remove '- ' and %
        let rangeArr = obj[k].replace(/(%)|(-\s)/g, '').split(' ')
        obj[k] = {
            low: Number.parseFloat(rangeArr[0]),
            high: Number.parseFloat(rangeArr[1])
        }
    })

    // Fix index if null
    obj.index = obj.index === '-' ? null : obj.index

    // Fix earning date value
    obj.earnings = convertDate(obj.earnings)

    return obj
}

/**
 * Stock object
 *
 * @typedef {Object} Stock
 * @property {string} ticker Stock ticker
 * @property {string} name Full company name
 * @property {string} site Company's web site
 * @property {string} exchange Stock exchange name
 * @property {string} sector The sector which a stock belongs to
 * @property {string} industry The industry which a stock belongs to
 * @property {string} country The country where company of selected stock is based
 * @property {string} index Major index membership
 * @property {number} pe Price-to-Earnings (ttm)
 * @property {number} eps Diluted EPS (ttm)
 * @property {number} insiderOwn Insider ownership
 * @property {number} shsOutstand Shares outstanding
 * @property {number} perfWeek Performance (Week)
 * @property {number} marketCap Market capitalization
 * @property {number} forwardPe Forward Price-to-Earnings (next fiscal year)
 * @property {number} epsNextY EPS estimate for next year
 * @property {number} insiderTrans Insider transactions (6-Month change in Insider Ownership)
 * @property {number} shsFloat Shares float
 * @property {number} perfMonth Performance (Month)
 * @property {number} income Income (ttm)
 * @property {number} peg Price-to-Earnings-to-Growth
 * @property {number} epsNextQ EPS estimate for next quarter
 * @property {number} instOwn Institutional ownership
 * @property {number} shortFloat Short interest share
 * @property {number} perfQuarter Performance (Quarter)
 * @property {number} sales Revenue (ttm)
 * @property {number} ps Price-to-Sales (ttm)
 * @property {number} epsThisY EPS growth this year
 * @property {number} instTrans Institutional transactions (3-Month change in Institutional Ownership)
 * @property {number} shortRatio Short interest ratio
 * @property {number} perfHalfY Performance (Half Year)
 * @property {number} bookSh Book value per share (mrq)
 * @property {number} pb Price-to-Book (mrq)
 * @property {number} roa Return on Assets (ttm)
 * @property {number} targetPrice Analysts' mean target price
 * @property {number} perfYear Performance (Year)
 * @property {number} cashSh Cash per share (mrq)
 * @property {number} pc Price to cash per share (mrq)
 * @property {number} epsNext5Y Long term annual growth estimate (5 years)
 * @property {number} roe Return on Equity (ttm)
 * @property {{low: number, high: number}} range52W 52-Week trading range
 * @property {number} perfYtd Performance (Year To Date)
 * @property {number} dividend Dividend (annual)
 * @property {number} pfcf Price to Free Cash Flow (ttm)
 * @property {number} epsPast5Y Annual EPS growth past 5 years
 * @property {number} roi Return on Investment (ttm)
 * @property {number} high52W Distance from 52-Week High
 * @property {number} beta Beta
 * @property {number} dividendPercent Dividend yield (annual)
 * @property {number} quickRatio Quick Ratio (mrq)
 * @property {number} salesPast5Y Annual sales growth past 5 years
 * @property {number} grossMargin Gross Margin (ttm)
 * @property {number} low52W Distance from 52-Week Low
 * @property {number} atr Average True Range (14)
 * @property {number} employees Full time employees
 * @property {number} currentRatio Current Ratio (mrq)
 * @property {number} salesQq Quarterly revenue growth (yoy)
 * @property {number} operMargin Operating Margin (ttm)
 * @property {number} rsi Relative Strength Index
//! low -> week
 * @property {{low: number, high: number}} volatility Volatility (Week, Month)
 * @property {boolean} optionable Stock has options trading on a market exchange
 * @property {number} debtEq Total Debt to Equity (mrq)
 * @property {number} epsQq Quarterly earnings growth (yoy)
 * @property {number} profitMargin Net Profit Margin (ttm)
 * @property {number} relVolume Relative volume
 * @property {number} prevClose Previous close
 * @property {boolean} shortable Stock available to sell short
 * @property {number} ltDebtEq Long Term Debt to Equity (mrq)
//! BMO and AMC - need more details in stock object {{}}
 * @property {Date} earnings Earnings date BMO = Before Market Open, AMC = After Market Close
 * @property {number} payout Dividend Payout Ratio (ttm)
 * @property {number} avgVolume Average volume (3 month)
 * @property {number} price Current stock price
 * @property {number} recom Analysts' mean recommendation (1=Buy 5=Sell)
 * @property {number} sma20 Distance from 20-Day Simple Moving Average (%)
 * @property {number} sma50 Distance from 50-Day Simple Moving Average (%)
 * @property {number} sma200 Distance from 200-Day Simple Moving Average (%)
 * @property {number} volume Volume
 * @property {number} change Performance (today)
 */

/**
 * 
 * @param {string} ticker Stock ticker (AAPL or TSLA, etc)
 * @return {Stock} Full stock data object from finviz
 */
const getStock = async (ticker = '') => {
    try {
        if (ticker === '') {
            throw new Error('No ticker provided!')
        }

        const page = await getPage(ticker)

        if (page === '') {
            throw new Error('Finviz: ticker is not found or service is unavailable.')
        }

        // Select page data
        const $ = cheerio.load(page, null, false)
        headersTable = $('.content table:nth-child(1) table:nth-child(1) > tbody')
        mainTable = $('.content table.snapshot-table2:nth-child(2) > tbody').find('tr')

        // Parse non tabular data
        let stock = {
            ticker: $('#ticker').text(),
            name: $(headersTable).find('tr:nth-child(2) > td > a > b').text(),
            site: $(headersTable).find('tr:nth-child(2) > td > a').attr('href'),
            exchange: $('#ticker').next().text().replace(/[^a-zA-Z]+/g, ''),
            sector: $(headersTable).find('tr:nth-child(3) > td > a:nth-child(1)').text(),
            industry: $(headersTable).find('tr:nth-child(3) > td > a:nth-child(2)').text(),
            country: $(headersTable).find('tr:nth-child(3) > td > a:nth-child(3)').text()
        }

        // Iterate throw main financial table
        Array.prototype.map.call(mainTable, (line) => {
            const elements = $(line).find('td')
            elements.each((i, td) => {
                //          0    1    2    3
                // line => key:value:key:value etc.
                if (i % 2) {
                    // Set values
                    const key = $(elements[i - 1]).text(),
                        value = $(td).text()

                    stock[key] = value
                } else {
                    // Set keys
                    const key = $(td).text()
                    stock[key] = ''
                }
            })
        })

        stock = fixKeys(stock)
        stock = fixValues(stock)

        return stock

    } catch (error) {
        return {
            error: error.message
        }
    }
}

module.exports = getStock