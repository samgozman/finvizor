import * as finvizor from '../src';

test('Should get stock response from finviz', async () => {
    const stock = await finvizor.stock('AAPL');
    // Assert that response is not null at least
    expect(stock).not.toEqual({});
    // Assert that String data from the response is correct
    expect(stock.ticker).toBe('AAPL');
    expect(stock.name).toBe('Apple Inc');
    expect(stock.site.endsWith('apple.com')).toBe(true);
    expect(stock.exchange).toBe('NASD');
    expect(stock.sector).toBe('Technology');
    expect(stock.industry).toBe('Consumer Electronics');
    expect(stock.country).toBe('USA');
    expect(stock.dividend).toBeGreaterThan(0);
    expect(stock.dividendPercent).toBeGreaterThan(0);
    expect(stock.price).toBeGreaterThan(0);
    expect(stock.pe).toBeGreaterThan(0);
    expect(stock.shsOutstand).toBeGreaterThan(0);
    expect(stock.marketCap).toBeGreaterThan(0);
    expect(stock.shortFloat).toBeGreaterThan(0);
    expect(stock.shortRatio).toBeGreaterThan(0);

    // Assert that insider transaction exists
    expect(stock.insidersDeals.length).toBeGreaterThan(0);
});

test('Should get etf response from finviz', async () => {
    const stock = await finvizor.stock('QQQ');
    expect(stock).not.toEqual({});
    expect(stock.ticker).toBe('QQQ');
    expect(stock.name).toBe('Invesco QQQ Trust Series 1');
    expect(stock.sector).toBe('Financial');
    expect(stock.industry).toBe('Exchange Traded Fund');
    expect(stock.country).toBe('USA');
    expect(stock.price).toBeGreaterThan(0);
});

test('Should get stock with extension (BRK.A) from finviz', async () => {
    const stock = await finvizor.stock('BRK.A');
    // Assert that response is not null at least
    expect(stock).not.toEqual({});

    // Assert that String data from the response is correct
    expect(stock.ticker).toBe('BRK.A');
});

test('Should get error response from finviz', async () => {
    expect(finvizor.stock('Kek lol')).rejects.toThrow();
});
