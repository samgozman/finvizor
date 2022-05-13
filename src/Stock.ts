import { Insider } from './Insider';
import { Earnings } from './Earnings';

export interface Stock {
    /** Stock ticker */
    ticker: string;
    /** Full company name */
    name: string;
    /** Company's web site */
    site: string;
    /** Stock exchange name */
    exchange: string;
    /** The sector which a stock belongs to */
    sector: string;
    /** The industry which a stock belongs to */
    industry: string;
    /** The country where company of selected stock is based */
    country: string;
    /** Major index membership */
    index: string;
    /** Price-to-Earnings (ttm) */
    pe: number | null;
    /** Diluted EPS (ttm) */
    eps: number | null;
    /** Insider ownership (%) */
    insiderOwn: number | null;
    /** Shares outstanding */
    shsOutstand: number | null;
    /** Performance (Week) (%) */
    perfWeek: number | null;
    /** Market capitalization */
    marketCap: number | null;
    /** Forward Price-to-Earnings (next fiscal year) */
    forwardPe: number | null;
    /** EPS estimate for next year */
    epsNextY: number | null;
    /** Insider transactions (6-Month change in Insider Ownership) (%) */
    insiderTrans: number | null;
    /** Shares float */
    shsFloat: number | null;
    /** Performance (Month) (%) */
    perfMonth: number | null;
    /** Income (ttm) */
    income: number | null;
    /** Price-to-Earnings-to-Growth */
    peg: number | null;
    /** EPS estimate for next quarter */
    epsNextQ: number | null;
    /** Institutional ownership (%) */
    instOwn: number | null;
    /** Short interest share (%) */
    shortFloat: number | null;
    /** Performance (Quarter) (%) */
    perfQuarter: number | null;
    /** Revenue (ttm) */
    sales: number | null;
    /** Price-to-Sales (ttm) */
    ps: number | null;
    /** EPS growth this year (%) */
    epsThisY: number | null;
    /** Institutional transactions (3-Month change in Institutional Ownership) (%) */
    instTrans: number | null;
    /** Short interest ratio */
    shortRatio: number | null;
    /** Performance (Half Year) (%) */
    perfHalfY: number | null;
    /** Book value per share (mrq) */
    bookSh: number | null;
    /** Price-to-Book (mrq) */
    pb: number | null;
    /** Return on Assets (ttm) (%) */
    roa: number | null;
    /** Analysts' mean target price */
    targetPrice: number | null;
    /** Performance (Year) (%) */
    perfYear: number | null;
    /** Cash per share (mrq) */
    cashSh: number | null;
    /** Price to cash per share (mrq) */
    pc: number | null;
    /** Long term annual growth estimate (5 years) (%) */
    epsNext5Y: number | null;
    /** Return on Equity (ttm) (%) */
    roe: number | null;
    /** 52-Week trading range */
    range52W: { low: number | null; high: number | null };
    /** Performance (Year To Date) (%) */
    perfYtd: number | null;
    /** Dividend (annual) */
    dividend: number | null;
    /** Price to Free Cash Flow (ttm) */
    pfcf: number | null;
    /** Annual EPS growth past 5 years (%) */
    epsPast5Y: number | null;
    /** Return on Investment (ttm) (%) */
    roi: number | null;
    /** Distance from 52-Week High (%) */
    high52W: number | null;
    /** Beta volatility is a measure of the systematic risk of a security */
    beta: number | null;
    /** Dividend yield (annual) (%) */
    dividendPercent: number | null;
    /** Quick Ratio (mrq) */
    quickRatio: number | null;
    /** Annual sales growth past 5 years (%) */
    salesPast5Y: number | null;
    /** Gross Margin (ttm) (%) */
    grossMargin: number | null;
    /** Distance from 52-Week Low (%) */
    low52W: number | null;
    /** Average True Range (14) */
    atr: number | null;
    /** Full time employees */
    employees: number | null;
    /** Current Ratio (mrq) */
    currentRatio: number | null;
    /** Quarterly revenue growth (yoy) (%) */
    salesQq: number | null;
    /** Operating Margin (ttm) (%) */
    operMargin: number | null;
    /** Relative Strength Index */
    rsi: number | null;
    /** Volatility (Week, Month) (%) */
    volatility: { week: number | null; month: number | null };
    /** Stock has options trading on a market exchange */
    optionable: boolean;
    /** Total Debt to Equity (mrq) */
    debtEq: number | null;
    /** Quarterly earnings growth (yoy) (%) */
    epsQq: number | null;
    /** Net Profit Margin (ttm) (%) */
    profitMargin: number | null;
    /** Relative volume */
    relVolume: number | null;
    /** Previous close */
    prevClose: number | null;
    /** Stock available to sell short */
    shortable: boolean;
    /** Long Term Debt to Equity (mrq) */
    ltDebtEq: number | null;
    /** Earnings date (UTC time in milliseconds from 1970-01-01). marketTime: BMO = Before Market Open, AMC = After Market Close */
    earnings: Earnings;
    /** Dividend Payout Ratio (ttm) (%) */
    payout: number | null;
    /** Average volume (3 month) */
    avgVolume: number | null;
    /** Current stock price */
    price: number | null;
    /** Analysts' mean recommendation (1=Buy 5=Sell) */
    recom: number | null;
    /** Distance from 20-Day Simple Moving Average (%) */
    sma20: number | null;
    /** Distance from 50-Day Simple Moving Average (%) */
    sma50: number | null;
    /** Distance from 200-Day Simple Moving Average (%) */
    sma200: number | null;
    /** Volume */
    volume: number | null;
    /** Performance (today) (%) */
    change: number | null;
    /** Array of insiders tades */
    insidersDeals: Array<Insider>;
}
