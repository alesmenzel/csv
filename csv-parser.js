/* eslint-disable no-loop-func */
const {Transform} = require('stream')

// Default options
const DELIMITER = ','
const ROW_DELIMITER = '\n'
const QUOTE = '"'
const ESCAPE = '\\'
// Constants
const CR = '\r'

class CSVParser extends Transform {
  #delimiter;

  #rowDelimiter;

  #quote;

  #escape;

  #cells = [];

  #rowCount = 0;

  #columnCount = null;

  #leftover = ''

  constructor({ delimiter = DELIMITER, quote = QUOTE, escape = ESCAPE, rowDelimiter = ROW_DELIMITER, ...rest } = {}) {
    super({
      ...rest,
      readableObjectMode: true,
    })

    if (!delimiter) throw new Error('Delimiter must be set')
    if (!delimiter.length) throw new Error('Delimiter must be length of exactly 1')

    if (!quote) throw new Error('Quote must be set')
    if (!quote.length) throw new Error('Quote must be length of exactly 1')

    if (!escape) throw new Error('Escape must be set')
    if (!escape.length) throw new Error('Escape must be length of exactly 1')

    if (!rowDelimiter) throw new Error('Row delimiter must be set')
    if (!rowDelimiter.length) throw new Error('Row delimiter must be length of exactly 1')

    this.#delimiter = delimiter;
    this.#rowDelimiter = rowDelimiter;
    this.#quote = quote;
    this.#escape = escape;
  }

  _parse(csvStr, encoding, next) {
    let i = 0;
    let rowStart = 0;
    let cell = ''
    let quoted = false
    let startOfCell = true
    let endOfCell = false
    let escaped = false

    while (csvStr[i] !== undefined) {
      const char = csvStr[i]
      const nextChar = csvStr[i + 1]
      i += 1

      // Start of cell
      if (startOfCell) {
        startOfCell = false
        // Optional quoting
        if (!quoted && char === this.#quote) {
          quoted = true
          continue;
        }
      }

      // Escaping with escape character
      if (!escaped && char === this.#escape) {
        cell += char
        escaped = true;
        continue;
      }
      // Escaping by preceeding quote with another quote
      if (!escaped && quoted && char === this.#quote && nextChar === this.#quote) {
        escaped = true;
        continue;
      }

      // End of cell
      if (!escaped && quoted && char === this.#quote) {
        quoted = false
        endOfCell = true
        continue;
      }

      // Delimiter
      if (!quoted && char === this.#delimiter) {
        startOfCell = true
        endOfCell = false
        this.#cells.push(cell)
        cell = ''
        continue;
      }

      // End of row
      if (!quoted && char === this.#rowDelimiter) {
        this.#cells.push(cell)
        cell = ''
        startOfCell = true
        endOfCell = false

        this.#rowCount += 1
        rowStart = i

        if (this.#columnCount === null) this.#columnCount = this.#cells.length
        if (this.#columnCount !== this.#cells.length) {
          next(new Error(`Row ${this.#rowCount} does not have the same number of columns as the first row, it has ${this.#cells.length}, but expected was ${this.#columnCount}`))
          return
        }

        const cells = this.#cells
        this.#cells = []

        // Backpressure
        if (!this.push(cells)) {
          this.once('drain', () => {
            this._parse(cell, encoding, next)
          })
          return
        }
        continue;
      }
      if (!quoted && char === CR) continue;

      // Do not allow any characters after quoted field except delimiter/row-delimiter
      if (endOfCell) {
        next(new Error(`No characters are allowed after quoted cell except delimiter, given '${char}' at line ${this.#rowCount + 1}, col ${i - rowStart}`))
        return
      }

      cell += char
      escaped = false
    }

    this.#leftover = cell
    next()
  }

  _transform(chunk, encoding, next) {
    const csvStr = this.#leftover + Buffer.isBuffer(chunk) ? chunk.toString() : chunk
    this._parse(csvStr, encoding, next)
  }
}

module.exports = CSVParser
