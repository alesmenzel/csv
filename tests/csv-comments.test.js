const fs = require('fs')
const path = require('path')
const {pipeline} = require('stream')
const { promisify } = require('util')
const Parser = require('../csv-parser')
const Collect = require('./collect')

const pipelineAsync = promisify(pipeline)

it('CSV: relax comments', async () => {
  const parser = new Parser({ relaxComments: true })
  const collect = new Collect()
  const input = fs.createReadStream(path.resolve(__dirname, 'csv-comments.csv'))
  const comments = []
  parser.on('comment', (comment) => {
    comments.push(comment)
  })
  await pipelineAsync(input, parser, collect)
  expect(collect.getData()).toMatchSnapshot('csv-comments.csv')
  expect(comments).toMatchSnapshot('csv-comments.csv--comments')
})
