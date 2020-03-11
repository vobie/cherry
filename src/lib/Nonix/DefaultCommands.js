import { it } from 'param.macro'
import childProcess from 'child_process'

function noop (input, args, meta) { return input }
function first (input, args, meta) { return input[0] } // these arrays behaving incredibly weird
function literal (input, args, meta) { return args }
function $ (input, args, meta, pipePositionIndex) {
  return meta.engine.select(args, input)[0]
}
function $$ (input, args, meta) { return meta.engine.select(args, input) }
const jsonS = JSON.stringify
const jsonP = JSON.parse

function sh (input, args, meta) {
  if (!process.env.ENABLE_UNSAFE_PIPE_CMDS) { throw new Error('Disabled for security reasons') }
  return childProcess.execSync(`echo ${input} | ${args}`).toString()
}
// Sandbox this? Put in function? As of now just returns what the statement returns
function js (input, args, meta) {
  if (!process.env.ENABLE_UNSAFE_PIPE_CMDS) { throw new Error('Disabled for security reasons') }
  return eval(args)
}
function jsFunc (input, args, meta) {
  if (!process.env.ENABLE_UNSAFE_PIPE_CMDS) { throw new Error('Disabled for security reasons') }
  return eval(args)(input, args, meta)
}
// Specific to Fb55 and just bad. Crashes often.
function attr (input, args, meta) { return (input[0] || input).attribs[args] }
function text (input, args, meta) {
  function getText (node) {
    if (node === null || node === undefined) { return '' }

    if (node.type === 'text') {
      return node.data
    } else if (node.type === 'tag') {
      return node.children.map(getText).map(it.trim()).join(' ')
    } else {
      return ''
    }
  }
  return getText(input)
}
module.exports = {
  $,
  $$,
  noop,
  attr,
  js,
  literal,
  jsonS,
  jsonP,
  sh,
  text,
  first,
  jsFunc
}
