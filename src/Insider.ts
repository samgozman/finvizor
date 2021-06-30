export interface Insider {
    /** Insider names */
    insiderTrading?: string;
    /** Link to inseder personal Finviz page */
    insiderTradingLink?: string;
    /** Insider position */
    relationship?: string;
    /** Date of trade */
    date?: string;
    /** Type of transaction (Sale, Buy, Option Exercise) */
    transaction?: string;
    /** Avg cost per share */
    cost?: string;
    /** Number of shares */
    shares?: string;
    /** Total value */
    value?: string;
    /** Amount of Securities Beneficially Owned Following Reported Transaction(s) */
    sharesTotal?: string;
    /** SEC form date */
    secForm4?: string;
    /** Link to SEC form 4 */
    secForm4Link?: string;
}
