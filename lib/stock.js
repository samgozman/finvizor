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
    Object.keys(obj).forEach( (key) => {
        let newKey = key
        // 'Dividend %' => 'Dividend Percent'
        newKey = newKey.replace(/%/gi, 'Percent')
        // '52W High' => ' High52W'
        const startsWithNumber = newKey.match(/^([0-9]{2}[A-Z]{1})/mg)
        if(startsWithNumber) {
            newKey = newKey.replace(/^([0-9]{2}[A-Z]{1})/mg, '')
            newKey += startsWithNumber[0]
        }
        // 'RSI (14)' => 'RSI '
        newKey = newKey.replace(/\(.*?\)/g, '')
        // 'P/C' => 'PC', 'P/FCF' => 'P/CF' || 'EPS Q/Q' => 'EPS QQ'
        if(newKey.match(/(^[A-z]{1}\/)|(\s[A-z]{1}\/)/g)) {
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
        mainTable = $('.content table:nth-child(2) > tbody').find('tr')

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

        // Fix keys
        stock = fixKeys(stock)

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