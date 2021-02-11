const finvizor = require('..')

test('Should get stock response from finviz', async () => {
    let stock = await finvizor.stock('AAPL')
    // Assert that response is not null at least
    expect(stock).not.toEqual({})

    // Assert that String data from the response is correct
    expect(stock.ticker).toBe('AAPL')
})

test('Should get error response from finviz', async () => {
    let stock = await finvizor.stock('Kek lol')
    // Assert that response is not null at least
    expect(stock.error).not.toBeNull()
})