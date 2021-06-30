/** BMO = Before Market Open, AMC = After Market Close */
export type MarketTime = 'AMC' | 'BMO' | '';

export interface Earnings {
    date: number;
    marketTime: MarketTime;
}
