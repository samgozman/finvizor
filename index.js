/**
 * Finviz.com stock data
 * ! Unofficial API
 */
const getStock = require('./lib/stock')

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
 * @property {number} insiderOwn Insider ownership (%)
 * @property {number} shsOutstand Shares outstanding
 * @property {number} perfWeek Performance (Week) (%)
 * @property {number} marketCap Market capitalization
 * @property {number} forwardPe Forward Price-to-Earnings (next fiscal year)
 * @property {number} epsNextY EPS estimate for next year
 * @property {number} insiderTrans Insider transactions (6-Month change in Insider Ownership) (%)
 * @property {number} shsFloat Shares float
 * @property {number} perfMonth Performance (Month) (%)
 * @property {number} income Income (ttm)
 * @property {number} peg Price-to-Earnings-to-Growth
 * @property {number} epsNextQ EPS estimate for next quarter
 * @property {number} instOwn Institutional ownership (%)
 * @property {number} shortFloat Short interest share (%)
 * @property {number} perfQuarter Performance (Quarter) (%)
 * @property {number} sales Revenue (ttm)
 * @property {number} ps Price-to-Sales (ttm)
 * @property {number} epsThisY EPS growth this year (%)
 * @property {number} instTrans Institutional transactions (3-Month change in Institutional Ownership) (%)
 * @property {number} shortRatio Short interest ratio
 * @property {number} perfHalfY Performance (Half Year) (%)
 * @property {number} bookSh Book value per share (mrq)
 * @property {number} pb Price-to-Book (mrq)
 * @property {number} roa Return on Assets (ttm) (%)
 * @property {number} targetPrice Analysts' mean target price
 * @property {number} perfYear Performance (Year) (%)
 * @property {number} cashSh Cash per share (mrq)
 * @property {number} pc Price to cash per share (mrq)
 * @property {number} epsNext5Y Long term annual growth estimate (5 years) (%)
 * @property {number} roe Return on Equity (ttm) (%)
 * @property {{low: number, high: number}} range52W 52-Week trading range
 * @property {number} perfYtd Performance (Year To Date) (%)
 * @property {number} dividend Dividend (annual)
 * @property {number} pfcf Price to Free Cash Flow (ttm)
 * @property {number} epsPast5Y Annual EPS growth past 5 years (%)
 * @property {number} roi Return on Investment (ttm) (%)
 * @property {number} high52W Distance from 52-Week High (%)
 * @property {number} beta Beta volatility is a measure of the systematic risk of a security
 * @property {number} dividendPercent Dividend yield (annual) (%)
 * @property {number} quickRatio Quick Ratio (mrq)
 * @property {number} salesPast5Y Annual sales growth past 5 years (%)
 * @property {number} grossMargin Gross Margin (ttm) (%)
 * @property {number} low52W Distance from 52-Week Low (%)
 * @property {number} atr Average True Range (14)
 * @property {number} employees Full time employees
 * @property {number} currentRatio Current Ratio (mrq)
 * @property {number} salesQq Quarterly revenue growth (yoy) (%)
 * @property {number} operMargin Operating Margin (ttm) (%)
 * @property {number} rsi Relative Strength Index
 * @property {{week: number, month: number}} volatility Volatility (Week, Month) (%)
 * @property {boolean} optionable Stock has options trading on a market exchange
 * @property {number} debtEq Total Debt to Equity (mrq)
 * @property {number} epsQq Quarterly earnings growth (yoy) (%)
 * @property {number} profitMargin Net Profit Margin (ttm) (%)
 * @property {number} relVolume Relative volume
 * @property {number} prevClose Previous close
 * @property {boolean} shortable Stock available to sell short
 * @property {number} ltDebtEq Long Term Debt to Equity (mrq)
 * @property {{date: number, marketTime: string}} earnings Earnings date (UTC time in milliseconds from 1970-01-01). marketTime: BMO = Before Market Open, AMC = After Market Close
 * @property {number} payout Dividend Payout Ratio (ttm) (%)
 * @property {number} avgVolume Average volume (3 month)
 * @property {number} price Current stock price
 * @property {number} recom Analysts' mean recommendation (1=Buy 5=Sell)
 * @property {number} sma20 Distance from 20-Day Simple Moving Average (%)
 * @property {number} sma50 Distance from 50-Day Simple Moving Average (%)
 * @property {number} sma200 Distance from 200-Day Simple Moving Average (%)
 * @property {number} volume Volume
 * @property {number} change Performance (today) (%)
 */

module.exports = {

    /**
     * Get full stock data from finviz.com
     *
     * @async
     * @param {string} ticker Stock ticker (AAPL or TSLA, etc)
     * @return {Promise.<Stock>} Full stock data object from finviz
     */
    stock: async (ticker) => {
        return await getStock(ticker)
    }
}