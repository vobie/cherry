import { pick } from '../index.js'

// html contains raw text nodes in a table. Not how it's handled by the default engine. Since only <td>s are selected, text nodes are ignored.
const html = `
<html>
  <table>
    <tr>
      row1
      <td>hej</td>
    </tr>
    <tr>
      <td>row2 cell1</td>
      <td>row2 cell2</td>
    </tr>
  </table>
  <table>
    <tr>
      row1
      <td>hej</td>
    </tr>
    <tr>
      <td>row2 cell1</td>
      <td>row2 cell2</td>
    </tr>
  </table>
</html>`
const extractor = {
  $: 'table', // selecting first table. Multi-select is done
  tableAs2dArr: [{ $: 'tr', _v: ['$ td | text'] }], // with brackets like this
  showoff: {
    noop: 'noop', // same as empty pipeline ("")
    bash: 'sh echo some shit && uptime \\| cut -f9-12 -d" " ', // sh commands can be escaped - ! - escaping might be a security weakness, Can preceding cmd escape away the next?
    js: 'js (console.warn("Fuck ya"), `input tag name is "${input.name}"`)',
    jsFuncShowMeta: 'jsFunc (input, args, meta) => meta'
  }
}
console.log('Extractor:')
console.dir(extractor)
console.log(`HTML: `)
console.log(html)

console.log(`Result:`)
console.dir(
  pick(html, extractor)
)
