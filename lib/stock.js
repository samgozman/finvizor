const got = require('got')
const cheerio = require('cheerio')

// URLs
const stockUrl = 'https://finviz.com/quote.ashx'

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

const getStock = async (ticker = '') => {
    try {
        if (ticker === '') {
            throw new Error('No ticker provided!')
        }

        const page = await getPage(ticker)

        if (page === '') {
            throw new Error('Finviz: ticker is not found or service is unavailable.')
        }

        // Parse page data
        const $ = cheerio.load(page, null, false)
        headersTable = $('.content table:nth-child(1) table:nth-child(1) > tbody')
        
        const stock = {
            ticker: $('#ticker').text(),
            name: $(headersTable).find('tr:nth-child(2) > td > a > b').text(),
            site: $(headersTable).find('tr:nth-child(2) > td > a').attr('href'),
            exchange: $('#ticker').next().text().replace(/[^a-zA-Z]+/g, '').toString(),
            sector: $(headersTable).find('tr:nth-child(3) > td > a:nth-child(1)').text(),
            subSector: $(headersTable).find('tr:nth-child(3) > td > a:nth-child(2)').text(),
            country: $(headersTable).find('tr:nth-child(3) > td > a:nth-child(3)').text()
        }

        return stock

    } catch (error) {
        return {
            error: error.message
        }
    }
}

module.exports = {
    getPage,
    getStock
}