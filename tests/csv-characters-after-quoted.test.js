const fs = require('fs')
const path = require('path')
const {pipeline} = require('stream')
const { promisify } = require('util')
const Parser = require('../csv-parser')
const Collect = require('./collect')

const pipelineAsync = promisify(pipeline)

it('CSV: relax characters after quoted cell', async () => {
  const parser = new Parser({ relaxCharactersAfterQuotedText: true })
  const collect = new Collect()
  const input = fs.createReadStream(path.resolve(__dirname, 'csv-characters-after-quoted.csv'))
  await pipelineAsync(input, parser, collect)
  expect(collect.getData()).toMatchSnapshot('csv-characters-after-quoted.csv')
})
