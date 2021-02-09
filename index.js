const {
    getPage,
    getStock
} = require('./lib/stock')

const main = async () => {
    const stock =  await getStock('SPCE')
    console.log(stock)
}
main()