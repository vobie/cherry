import parser from 'htmlparser2'
import CSSselect from 'css-select'
module.exports = {
  init (html) { return parser.parseDOM(html) },
  select (selector, context) { return CSSselect(selector, context) }
}
// Can the select/context be generalized? [Points in text], [regex to find nearby] is one for example... think!
