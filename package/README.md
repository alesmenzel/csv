# @alesmenzel/csv

Simple and elegant streaming `csv` parser.

Handles formats defined by [RFC4180](https://tools.ietf.org/html/rfc4180) but also works with format produced by PHP's [fputcsv](https://www.php.net/manual/en/function.fputcsv.php). Note in mind, that there is no defacto standard for CSV and different csv libraries create slightly different versions, for example some of them

- use comments in csv `# this is a comment`
- use escaping character instead of double quoting `"\""` (this is valid csv cell in PHP's version)
- use blank spaces after quoted fields `"abc" , "cde"`
- output different column count per each row

```csv
a,b,c
1,2
4,5,6
```

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

## Options

| Option                                             | Description                                                          | Default Value                    |
| -------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------- |
| `delimiter`                                        | Single character that is used to delimit the cells in a row.         | `,`                              |
| `rowDelimiter`                                     | Single character that is used to delimit the rows in the input.      | `\n` (optionally preceded by \r) |
| `quote`                                            | Single character that is used to quote the value of a cell.          | `"`                              |
| `escape`                                           | Single character that is used to escape a character inside the cell. | `\`                              |
| `highWaterMark` and other transform stream options | Other options are passed to the underlaying Transform stream.        | `-`                              |

## Licence

This package is developed under the [MIT licence](./LICENCE.md).
