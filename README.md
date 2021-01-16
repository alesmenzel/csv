# @alesmenzel/csv

Simple and elegant streaming `csv` parser.

Handles formats defined by [RFC4180](https://tools.ietf.org/html/rfc4180) but also works with format produced by PHP's fputcsv

## Installation

```bash
npm i --save @alesmenzel/csv
```

## Usage

```js
const createCSVParser = require('@alesmenzel/csv')

const csv = new createCSVParser({
  // delimiter: ',' (default)
  // quote: '"' (default)
  // rowDelimiter: '\n' (default) - handles \r\n as well
  // escape: '\\' (default)
  // ... you can pass Transform stream options here - e.g. highWaterMark
})

const rows = []
csv.on('data', (row) => {
  rows.push(row)
})

csv.on('end', () => {
  console.log(rows)
})

csv.write('A,B,C\n')
csv.write('a,b,c\n')
csv.end('x,"Joe ""The Death"" Black",z\n')
```
