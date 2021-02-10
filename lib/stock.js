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
    range.forEach( (k) => {
        // Remove '- ' and %
        let rangeArr = obj[k].replace(/(%)|(-\s)/g, '').split(' ')
        obj[k] = {
            low: Number.parseFloat(rangeArr[0]),
            high: Number.parseFloat(rangeArr[1])
        }
    })

    // Fix index if null
    obj.index = obj.index === '-' ? null : obj.index
    return obj
}

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
            subSector: $(headersTable).find('tr:nth-child(3) > td > a:nth-child(2)').text(),
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

module.exports = {
    getStock
}