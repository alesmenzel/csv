const fs = require('fs')
const path = require('path')
const {pipeline} = require('stream')
const { promisify } = require('util')
const Parser = require('../csv-parser')
const Collect = require('./collect')

const pipelineAsync = promisify(pipeline)
const files = [{
  file: 'random-csv-100K.csv',
  budgetSeconds: 12
}, {
  file: 'random-csv-10K.csv',
  budgetSeconds: 1.2
}]

files.forEach(({file, budgetSeconds}) => {
  it(`CSV Benchmark: ${file}`, async () => {
    const parser = new Parser()
    const collect = new Collect()
    const input = fs.createReadStream(path.resolve(__dirname, '../csv-benchmark/', file))
    const start = Date.now()
    await pipelineAsync(input, parser, collect)
    const took = (Date.now() - start) / 1000
    expect(took).toBeLessThanOrEqual(budgetSeconds)
  }, budgetSeconds * 1000)
})
