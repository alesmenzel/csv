const fs = require('fs')
const path = require('path')
const {pipeline} = require('stream')
const { promisify } = require('util')
const Parser = require('../csv-parser')
const Collect = require('./collect')

const pipelineAsync = promisify(pipeline)
const files = fs.readdirSync(path.resolve(__dirname, '../csv')).map(file => [file])

it.each(files)('CSV: %s', async (file) => {
  const parser = new Parser()
  const collect = new Collect()
  const input = fs.createReadStream(path.resolve(__dirname, '../csv/', file))
  await pipelineAsync(input, parser, collect)
  expect(collect.getData()).toMatchSnapshot(file)
})
