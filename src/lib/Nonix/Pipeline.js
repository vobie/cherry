import { it, _ } from 'param.macro'
import stringify from 'json-stringify-safe'
import split from 'split-string'
import defaultCommands from './DefaultCommands.js'
import _debug from 'debug'
const debug = _debug('cherry:Nonix:Pipeline')
/**
* Unix-style pipeline using js functions. Executes once, so more or less a reduce operation.
* With the sh command (unsafe) able to incorporate unix programs installed on the server.
*
* Note that this is more or less an instant RCE exploit if the pipeline comes from an untrusted source.
* Set ENABLE_UNSAFE_PIPE_CMDS environment variable to enable
*/

/**
* Pipeline ""parser"". To be replaced by a real parser.
* Pipe blocks might not all look like "cmd arg1 ..." in the future.
* Big thanks to @jonschlinkert for providing this boring library that allowed me to skip the parser for now.
*/
function parse (pipeStr) {
  let blocks = split(pipeStr, { separator: '|', quotes: false, brackets: false })
    .map(it.trim())
    .map(parseOPs)

  return blocks
}
function parseOPs (opStr) {
  const whitespaceRegex = /\s+/g
  const result = whitespaceRegex.exec(opStr)
  if (result) {
    const [start, end] = [result.index, whitespaceRegex.lastIndex]
    return { cmd: opStr.substring(0, start), args: opStr.substring(end, opStr.length) }
  }
  return { cmd: opStr, args: '' }
}

/**
* Helpers
*/
function notFoundNoopFactory (cmd) {
  return function (input) {
    console.warn(`[NOOP] Unknown pipeline cmd "${cmd}", ignored`)
    return input
  }
}

class Pipeline {
  constructor (pipeStr, meta = {}, commandsExtension = {}) {
    this.meta = meta
    this.parsedPipe = parse(pipeStr)
    this.commandLookup = { ...defaultCommands, ...commandsExtension }
  }
  exec (input) {
    // rather than handling this stuff in the pipeline, perhaps pull out any leading $ into {$: ..., _v: "rest of pipeline"}
    // that way pipeline does not have to deal with array inputs
    const firstOP = this.parsedPipe[0]
    const remainingPipe = this.parsedPipe.slice(1)
    if (this.meta.shouldSelectMulti) {
      debug('Multi pipeline')
      if (firstOP.cmd === '$') {
        return this.commandLookup['$$'](input, firstOP.args, this.meta).map((element) => this.reducePipe(element, remainingPipe))
      } else {
        return input.map((element) => this.reducePipe(element, this.parsedPipe))
      }
    } else {
      return this.reducePipe(input, this.parsedPipe)
    }
  }
  reducePipe (input, pipe) {
    return pipe.reduce((acc, op, pipePositionIndex) => {
      const func = (this.commandLookup[op.cmd] || notFoundNoopFactory(op.cmd))

      debug(`[Reduced] Pipeline step ${pipePositionIndex}, cmd: ${JSON.stringify(op)}`)
      return func(acc, op.args, this.meta, pipePositionIndex)
    }, input)
  }
}

module.exports = Pipeline
/*
Input: DOM tree
#selector
Output: List of dom nodes

if block valid css selector. use as $
if a cmd just happens to be valid, use preceeding |

>>
>
@
$$ (select all)
$
{key}
/regex/ >

example

#headline | random (> _key) | scramble

_keys : literal allow writing to keys on same document level > key
*/
