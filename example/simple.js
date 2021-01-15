/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { Writable, pipeline } = require("stream");
const {promisify} = require('util')
const Parser = require("../csv-parser");

const pipelineAsync = promisify(pipeline)
const file = fs.createReadStream(path.resolve(__dirname, 'simple.csv'))
const parser = new Parser()
const result = []

const logger = new Writable({
  objectMode: true,

  write(row, enc, next) {
    result.push(row)
next()
  },

  writev(rows, enc, next) {
    result.push(...rows)
    next()
  },

  final(next) {
    const [header, ...records] = result
    console.log('HEADER')
    console.log('----------------------')
    console.log(header)
    console.log()
    console.log('RECORDS')
    console.log('----------------------')
    console.log(records)
    next()
  },
})


pipelineAsync(file, parser, logger)
