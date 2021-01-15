const fs = require('fs')
const path = require('path')
const {pipeline} = require('stream')
const { promisify } = require('util')
const Parser = require('../csv-parser')
const Collect = require('./collect')

const pipelineAsync = promisify(pipeline)

it('CSV: colon delimiter', async () => {
  const parser = new Parser({ delimiter: ':' })
  const collect = new Collect()
  const input = fs.createReadStream(path.resolve(__dirname, 'csv-colons.csv'))
  await pipelineAsync(input, parser, collect)
  expect(collect.getData()).toMatchSnapshot('csv-colons.csv')
})
