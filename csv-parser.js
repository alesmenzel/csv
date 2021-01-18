/* eslint-disable no-loop-func */
const {Duplex} = require('stream')
const {stripBOM} = require('./util')

// Default options
const DELIMITER = ','
const ROW_DELIMITER = '\n'
const QUOTE = '"'
const ESCAPE = '\\'
const COMMENT = '#'
// Constants
const CR = '\r'

class CSVParser extends Duplex {
  // Cell delimiter
  #delimiter;

  // Row delimiter
  #rowDelimiter;

  // Quote option
  #quote;

  // Escape option
  #escape;

  // Comment character
  #comment;

  // Strip BOM
  #bom = true

  // Relax: Allow comments inside the csv
  #relaxComments;

  // Relax: Allow characters after quoted text, but ignore those
  #relaxCharactersAfterQuotedText;

  // Relax: Allow rows with incorrect column count
  #relaxColumnCount;

  // Cells parsed from a row
  #cells = [];

  // Current parsed row count
  #rowCount = 0;

  // Tracks the column (character) we are at from the start of row
  #charCount = 1

  // Number of columns in the CSV
  #columnCount = null;

  // Accumulator for cell
  #cell = ''

  // Leftover CSV that cannot be parsed without next chunk
  #leftover = ''

  // Are we in a quoted cell?
  #quoted = false

  // Are we in a comment?
  #commented = false;

  // Are we at the start of a new line
  #startOfLine = true

  // Are we at the start of a cell?
  #startOfCell = true

  // Are we at the end of a cell?
  #endOfCell = false

  // Are we escaping the current character?
  #escaped = false

  // Is it the first chunk?
  #firstChunk = true

  constructor({
    delimiter = DELIMITER,
    quote = QUOTE,
    escape = ESCAPE,
    rowDelimiter = ROW_DELIMITER,
    comment = COMMENT,
    bom = true,
    relaxComments = false,
    relaxCharactersAfterQuotedText = false,
    relaxColumnCount = false,
    ...rest
  } = {}) {
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
    this.#comment = comment;
    this.#bom = bom;
    this.#relaxComments = relaxComments;
    this.#relaxCharactersAfterQuotedText = relaxCharactersAfterQuotedText;
    this.#relaxColumnCount = relaxColumnCount;
  }

  _parse(csvStr, next) {
    this.#leftover = ''
    let i = 0;

    while (csvStr[i] !== undefined) {
      const char = csvStr[i]
      const nextChar = csvStr[i + 1]

      // Last character in chunk is QUOTE, but we need next chunk to decide if it is end of cell or just text
      if (i === csvStr.length - 1 && char === this.#quote) {
        this.#leftover = csvStr.slice(i)
        next()
        return
      }

      this.#charCount += 1
      i += 1

      // Start of line
      if (this.#startOfLine) {
        this.#startOfLine = false
        // Comment line
        if (char === this.#comment && this.#relaxComments) {
          this.#commented = true
          this.#startOfCell = false
          continue;
        }
      }

      // Start of cell
      if (this.#startOfCell) {
        this.#startOfCell = false
        // Optional quoting
        if (!this.#quoted && char === this.#quote) {
          this.#quoted = true
          continue;
        }
      }

      // Escaping with escape character in quoted field
      if (!this.#escaped && this.#quoted && char === this.#escape) {
        this.#cell += char
        this.#escaped = true;
        continue;
      }
      // Escaping by preceeding quote with another quote in quoted field
      if (!this.#escaped && this.#quoted && char === this.#quote && nextChar === this.#quote) {
        this.#escaped = true;
        continue;
      }

      // End of cell
      if (!this.#escaped && this.#quoted && char === this.#quote) {
        this.#quoted = false
        this.#endOfCell = true
        continue;
      }

      // Delimiter
      if (!this.#quoted && !this.#commented && char === this.#delimiter) {
        this.#startOfCell = true
        this.#endOfCell = false
        this.#cells.push(this.#cell)
        this.#cell = ''
        continue;
      }

      // End of row
      if (!this.#quoted && char === this.#rowDelimiter) {
        const cell = this.#cell
        this.#cell = ''
        this.#startOfLine = true
        this.#startOfCell = true
        this.#endOfCell = false

        // End of comment line
        if (this.#commented) {
          this.#commented = false
          this.emit('comment', cell)
          continue
        }

        this.#cells.push(cell)

        this.#rowCount += 1
        this.#charCount = 1

        if (this.#columnCount === null) this.#columnCount = this.#cells.length
        if (this.#columnCount !== this.#cells.length && !this.#relaxColumnCount) {
          next(new Error(`Row ${this.#rowCount} does not have the same number of columns as the first row, it has ${this.#cells.length}, but expected was ${this.#columnCount}`))
          return
        }

        const cells = this.#cells
        this.#cells = []

        // Backpressure
        if (!this.push(cells)) {
          this.once('read', () => this._parse(csvStr.slice(i), next))
          return
        }
        continue;
      }
      if (!this.#quoted && char === CR) continue;

      // Do not allow any characters after quoted field except delimiter/row-delimiter
      if (this.#endOfCell) {
        if (this.#relaxCharactersAfterQuotedText) continue
        next(new Error(`No characters are allowed after quoted cell except delimiter, given '${char}' at line ${this.#rowCount + 1}, col ${this.#charCount}`))
        return
      }

      this.#cell += char
      this.#escaped = false
    }

    next()
  }

  _write(chunk, encoding, next) {
    let csvStr = Buffer.isBuffer(chunk) ? chunk.toString() : chunk
    // BOM
    if (this.#firstChunk) {
      this.#firstChunk = false
      csvStr = stripBOM(csvStr)
    }
    this._parse(this.#leftover + csvStr, next)
  }

  _writev(chunks, next) {
    let csvStr = chunks
      .map(({chunk}) => Buffer.isBuffer(chunk) ? chunk.toString() : chunk)
      .reduce((acc, chunk) => acc + chunk, '')
    // BOM
    if (this.#firstChunk) {
      this.#firstChunk = false
      csvStr = stripBOM(csvStr)
    }
    this._parse(this.#leftover + csvStr, next)
  }

  _final(next) {
    if (this.#leftover) {
      // Handle CSVs that are missing row delimiter at the end
      if (!this.#leftover.endsWith(this.#rowDelimiter)) this.#leftover += this.#rowDelimiter
      this._parse(this.#leftover, () => {
        this.push(null);
        next()
      })
      return
    }
    this.push(null);
    next()
  }

  _read() {
    this.emit('read')
  }
}

module.exports = CSVParser
