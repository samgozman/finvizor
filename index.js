/**
 * Finviz.com stock data
 * ! Unofficial API
 */
const getStock = require('./lib/stock')

module.exports = {
    stock: async (ticker) => {
        return await getStock(ticker)
    }
}