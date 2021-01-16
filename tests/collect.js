const { Writable } = require('stream');

class Collect extends Writable {
  #data = [];

  constructor() {
    super({ objectMode: true })
  }

  _write(chunk, enc, next) {
    this.#data.push(chunk)
    next()
  }

  _writev(chunks, enc, next) {
    this.#data.push(...chunks)
    next()
  }

  getData() {
    return this.#data
  }
}

module.exports = Collect
