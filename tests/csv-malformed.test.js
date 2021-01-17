const fs = require('fs')
const path = require('path')
const {pipeline} = require('stream')
const { promisify } = require('util')
const Parser = require('../csv-parser')
const Collect = require('./collect')

const pipelineAsync = promisify(pipeline)
const files = [{
  file: 'bad-column-count.csv',
}, {
  file: 'chracters-after-quote.csv',
}]

files.forEach(({file}) => {
  it(`CSV Malformed: ${file}`, async () => {
    const parser = new Parser()
    const collect = new Collect()
    const input = fs.createReadStream(path.resolve(__dirname, '../csv-malformed/', file))
    await expect(pipelineAsync(input, parser, collect)).rejects.toThrow()
  })
})
