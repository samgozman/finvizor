# finvizor

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/samgozman/finvizor/finvizor%20Node.js)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/380de0bf9a8e423a9eb7b2c51355c52b)](https://app.codacy.com/gh/samgozman/finvizor?utm_source=github.com&utm_medium=referral&utm_content=samgozman/finvizor&utm_campaign=Badge_Grade_Settings)
[![npm](https://img.shields.io/npm/v/finvizor)](https://www.npmjs.com/package/finvizor)
![npm bundle size](https://img.shields.io/bundlephobia/min/finvizor)
![NPM](https://img.shields.io/npm/l/finvizor)

Get full financial data from **finviz**!

## Installation

Install package from NPM

```bash
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
  earnings: { date: 1611694800000, marketTime: 'AMC' },
  payout: 21.6,
  avgVolume: 103190000,
  price: 134.24,
  recom: 2,
  sma20: -0.92,
  sma50: 2.49,
  sma200: 21.89,
  volume: 5659762,
  change: -0.66,
  insidersDeals: [
    {
      insiderTrading: 'Williams Jeffrey E',
      insiderTradingLink: 'https://finviz.com/insidertrading.ashx?oc=1496686&tc=7',
      relationship: 'COO',
      date: 'Apr 05',
      transaction: 'Sale',
      cost: '125.74',
      shares: '133,867',
      value: '16,832,437',
      sharesTotal: '489,490',
      secForm4: 'Apr 05 06:36 PM',
      secForm4Link: 'http://www.sec.gov/Archives/edgar/data/320193/000032019321000046/xslF345X03/wf-form4_161766207883637.xml'
    }
    ...
  ]
}
```
