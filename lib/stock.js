const got = require('got'),
    cheerio = require('cheerio'),
    _ = require('lodash')

// URLs
const stockUrl = 'https://finviz.com/quote.ashx'

// Capitalize each first letters (for insider names)
const capitalizeFirstLetters = (str = '') => {
    var splitStr = str.toLowerCase().split(' ')
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
    }
    return splitStr.join(' ')
}

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
 * @returns {number} Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC.
 */
const convertDate = (dateString = '') => {
    // Use only firts two statements from the date string
    const dateArr = dateString.split(' '),
        currentDate = new Date(),
        date = new Date(dateArr[0] + dateArr[1])

    // To set proper year for the past date
    if ((currentDate.getMonth() - date.getMonth()) < 0) {
        date.setFullYear(currentDate.getUTCFullYear() - 1)
    } else {
        date.setFullYear(currentDate.getFullYear())
    }

    // Add: BMO = Before Market Open, AMC = After Market Close
    return {
        date: date.valueOf(),
        marketTime: dateArr[2] || ''
    }
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
    // Keys that was already processed (good to go)
    const processed = [
        'index',
        'country',
        'industry',
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
                newValue = Math.floor(+newValue.replace(/M/g, '') * 1.0e+6)
            } else if (newValue.match(/B/g)) {
                newValue = Math.floor(+newValue.replace(/B/g, '') * 1.0e+9)
            } else {
                newValue = +newValue
            }

            obj[key] = newValue || null
        } else {
            // Fix boolean values
            obj[key] = obj[key] === 'Yes' ? true : obj[key]
            obj[key] = obj[key] === 'No' ? false : obj[key]
        }
    })

    // Fix range values for volatility: '1.57% 2.63%' => { week: 1.57, month: 2.63 }
    //              and for range52W: '53.15 - 145.09' => { low: 53.15, high: 145.09 }
    range.forEach((k) => {
        // Remove '- ' and %
        let rangeArr = obj[k].replace(/(%)|(-\s)/g, '').split(' ')

        if (k === 'volatility') {
            obj[k] = {
                week: +rangeArr[0],
                month: +rangeArr[1]
            }
        } else {
            obj[k] = {
                low: +rangeArr[0],
                high: +rangeArr[1]
            }
        }
    })

    // Fix index if null
    obj.index = obj.index === '-' ? null : obj.index

    // Fix earning date value
    obj.earnings = convertDate(obj.earnings)

    return obj
}

const getStock = async (ticker = '') => {
    try {
        if (ticker === '') {
            throw new Error('No ticker provided!')
        }

        ticker = ticker.replace(/\./g, '-')

        const page = await getPage(ticker)

        if (page === '') {
            throw new Error('Finviz: ticker is not found or service is unavailable.')
        }

        // Select page data
        const $ = cheerio.load(page, null, false),
            headersTable = $('.content table:nth-child(1) table:nth-child(1) > tbody'),
            mainTable = $('.content table.snapshot-table2:nth-child(2) > tbody').find('tr'),
            insidersTable = $('.content > .container > table:nth-child(3) > tbody table.body-table > tbody').find('tr')

        // Parse non tabular data
        let stock = {
            ticker: $('#ticker').text().replace(/-/g, '.'),
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

        // Create insiderDeals array
        stock.insidersDeals = []
        Array.prototype.map.call(insidersTable, (line, index) => {
            const elements = $(line).find('td')
            let insObj = {}
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
                    secForm4Link: $(elements[8]).find('a').attr('href')
                }

                stock.insidersDeals.push(insObj)
            }
        })

        return stock

    } catch (error) {
        return {
            error: error.message
        }
    }
}

module.exports = getStock