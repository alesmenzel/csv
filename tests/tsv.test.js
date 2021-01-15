const fs = require('fs')
const path = require('path')
const {pipeline} = require('stream')
const { promisify } = require('util')
const Parser = require('../csv-parser')
const Collect = require('./collect')

const pipelineAsync = promisify(pipeline)

it('TSV: simple', async () => {
  const parser = new Parser({ delimiter: '\t' })
  const collect = new Collect()
  const input = fs.createReadStream(path.resolve(__dirname, 'tsv-simple.tsv'))
  await pipelineAsync(input, parser, collect)
  expect(collect.getData()).toMatchSnapshot('tsv-simple.tsv')
})
