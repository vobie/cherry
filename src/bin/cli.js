#!/usr/bin/env node
const program = require('commander')
const cherry = require('../index.js')

program
  .version('0.1.0')
  .option('-e, --extractor <extractor>', 'extractor .json file')
  .option('-E <extractorPath>', 'extractor JSON string')
  .option('-h --html <html>', 'input html')
  .parse(process.argv)

// console.log(program)

if (!program.extractor || program.extractorPath) {
  console.error('No extractor')
  process.exit()
}
if (program.html) {
  console.log(cherry.pick(program.html, JSON.parse(program.extractor)))
} else {
  process.stdin.setEncoding('utf8')

  let chunks
  process.stdin.on('readable', () => {
    let chunk
    // Use a loop to make sure we read all available data.
    while ((chunk = process.stdin.read()) !== null) {
      // process.stdout.write(`data: ${chunk}`)
      chunks += chunk
    }
  })

  process.stdin.on('end', () => {
    console.log(cherry.pick(chunks, JSON.parse(program.extractor)))
  })
}
