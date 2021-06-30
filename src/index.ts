/**
 * Finviz.com stock data
 * ! Unofficial API
 */
import { getStock } from './quote';
import { Stock } from './Stock';

export async function stock(ticker: string): Promise<Stock> {
    return await getStock(ticker);
}

export default stock;
