const { Writable } = require('stream');

// /**
//  * Collect all rows and return them
//  * @param {import('stream').Readable} stream
//  */
// async function collect (stream) {
//   return new Promise((resolve, reject) => {
//     const rows = [];

//     stream.on('data', (row) => {
//       rows.push(row)
//     })
//     stream.on('end', () => {
//       resolve(rows)
//     })

//     stream.on('error', reject)
//   })
// }

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
