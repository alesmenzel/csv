# @alesmenzel/csv

Simple and elegant streaming `csv` parser.

Handles formats defined by [RFC4180](https://tools.ietf.org/html/rfc4180) but also works with format produced by PHP's [fputcsv](https://www.php.net/manual/en/function.fputcsv.php). Note in mind, that there is no defacto standard for CSV and different csv libraries create slightly different versions, for example some of them

- use comments in csv `# this is a comment` (see [`relaxComments` and `comment`](#options) options)
- use escaping character instead of double quoting `"\""` (this is valid csv cell in PHP's version, handled by default)
- use blank spaces after quoted fields `"abc" ,"cde"` (see [`relaxCharactersAfterQuotedText`](#options) option)
- output different column count per each row (see `relaxColumnCount` option)
- [Byte Order Mark (BOM)](https://en.wikipedia.org/wiki/Byte_order_mark) at the start of CSV (see [`bom`](#options) option)

By default we are very strict about parsing the CSV, but can use the [`relax*`](#options) rules to lower the bar.

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
  // ... and other (see options below)
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

| Option                                             | Description                                                                                   | Default Value                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| `delimiter`                                        | Single character that is used to delimit the cells in a row.                                  | `,`                              |
| `rowDelimiter`                                     | Single character that is used to delimit the rows in the input.                               | `\n` (optionally preceded by \r) |
| `quote`                                            | Single character that is used to quote the value of a cell.                                   | `"`                              |
| `escape`                                           | Single character that is used to escape a character inside the cell.                          | `\`                              |
| `comment`                                          | Single character that is used to define a comment line.                                       | `#`                              |
| `bom`                                              | Strip BOM from the first line of CSV if present.                                              | `true`                           |
| `relaxComments`                                    | Allow comments in CSV. Comments are lines that start with the `comment` character.            | `false`                          |
| `relaxCharactersAfterQuotedText`                   | Allow extranious characters after end of quoted cell, but those extra characters are ignored. | `false`                          |
| `relaxComments`                                    | Allow comments in CSV. Comments are lines that start with the `comment` character.            | `false`                          |
| `relaxColumnCount`                                 | Allow inconsistent column count per each row.                                                 | `false`                          |
| `highWaterMark` and other transform stream options | Other options are passed to the underlaying Transform stream.                                 | `-`                              |

## Events

Besides the standard stream events, we emit the following:

### Event `"comment" (comment: string)`

When a comment line is found. The payload is the actual comment string without the comment character (e.g. `#`).

```js
csv.on('comment', (comment: string) => {
  // ...
})
```

## Licence

This package is developed under the [MIT licence](./LICENCE.md).
