"use strict";

var _htmlparser = _interopRequireDefault(require("htmlparser2"));

var _cssSelect = _interopRequireDefault(require("css-select"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  init(html) {
    return _htmlparser.default.parseDOM(html);
  },

  select(selector, context) {
    return (0, _cssSelect.default)(selector, context);
  }

}; // Can the select/context be generalized? [Points in text], [regex to find nearby] is one for example... think!