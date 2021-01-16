/* eslint-disable no-console, import/no-extraneous-dependencies */
const fs = require('fs').promises
const csvStringify = require('csv-stringify')
const faker = require('faker')

async function main() {
  const rows = [
    ['ID', 'number', 'uuid', 'address', 'name', 'phone', 'phrase']
  ]

  for (let i = 0; i < 1e4; i += 1) {
    rows.push([
      String(i + 1),
      String(faker.random.number()),
      faker.random.uuid(),
      faker.address.streetAddress(),
      faker.name.findName(),
      faker.phone.phoneNumber(),
      faker.hacker.phrase()
    ])
  }

  const csvStr = await new Promise((resolve, reject) => {
    csvStringify(rows, (err, output) => {
      if (err) {
        reject(err)
        return
      }
      resolve(output)
    })
  })

  await fs.writeFile('random-csv-10K.csv', csvStr)

  return 'Done!'
}

main().then(res => {
  console.log(res)
  process.exit()
}, err => {
  console.error(err)
  process.exit(1)
})
