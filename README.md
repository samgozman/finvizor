![GitHub Workflow Status](https://img.shields.io/github/workflow/status/samgozman/finvizor/finvizor%20Node.js) 
[![npm](https://img.shields.io/npm/v/finvizor)](https://www.npmjs.com/package/finvizor)
![npm bundle size](https://img.shields.io/bundlephobia/min/finvizor)
![NPM](https://img.shields.io/npm/l/finvizor)

# finvizor
Get full financial data from **finviz**!

## Installation
Install package from NPM

```
npm install finvizor
```

## Features

The main differences and advantages in comparison with similar NPM modules are the more convenient presentation of the data returned by the function.

### Object Keys
Object keys have been redesigned to make them look meaningful and readable. No more string keys in NPM modules! Camel case is used in key names only where it is needed. For instance 'P/E' => 'pe', 'Target price' => 'targetPrice' etc.

![Finviz parser](https://media.giphy.com/media/UzAtu9issLI0x7drmG/source.gif)

All keys (and there are more than 80 of them) have short descriptions taken from the official site.

### Object Values

All numeric key values are presented as numerical values, rather than strings as default. Boolean values, ranges and the date of earnings are also parsed separately. 
All this is done so that the data from the site can be used in your code for calculations right out of the box!

## Usage
Use **finvizor** in async functions

```javascript
const finvizor = require('finvizor')

const main = async () => {
	const stock = await finvizor.stock('AAPL')
	console.log(stock)
}

main()
```

### Returns
> await finvizor.stock('AAPL')

```javascript
{
  ticker: 'AAPL',
  name: 'Apple Inc.',
  site: 'http://www.apple.com',
  exchange: 'NASD',
  sector: 'Technology',
  industry: 'Consumer Electronics',
  country: 'USA',
  index: 'DJIA S&P500',
  pe: 36.53,
  eps: 3.7,
  insiderOwn: 0.07,
  shsOutstand: 16940000000,
  ...
  earnings: { date: 2021-01-26T21:00:00.000Z, marketTime: 'AMC' },
  payout: 21.6,
  avgVolume: 103190000,
  price: 134.24,
  recom: 2,
  sma20: -0.92,
  sma50: 2.49,
  sma200: 21.89,
  volume: 5659762,
  change: -0.66
}
```
