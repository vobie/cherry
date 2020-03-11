"use strict";

var _isString2 = _interopRequireDefault(require("lodash/isString"));

var _isObject2 = _interopRequireDefault(require("lodash/isObject"));

var _has2 = _interopRequireDefault(require("lodash/has"));

var _isArray2 = _interopRequireDefault(require("lodash/isArray"));

var _isFunction2 = _interopRequireDefault(require("lodash/isFunction"));

var _mapValues2 = _interopRequireDefault(require("lodash/mapValues"));

var _omit2 = _interopRequireDefault(require("lodash/omit"));

var _Fb = _interopRequireDefault(require("./engines/Fb55.js"));

var _Pipeline = _interopRequireDefault(require("./lib/Nonix/Pipeline.js"));

var _jsonStringifySafe = _interopRequireDefault(require("json-stringify-safe"));

var _debug2 = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ENGINES = {};
ENGINES["Fb55"] = _Fb.default;
const debug = (0, _debug2.default)('cherry');
/**
  Constants
*/

const SPECIAL_KEYS = {
  PRE: '$',
  VALUE: '_v' // pipeline, ($,context,meta) => ...
  // DYNAMIC_EXTRACTOR: '_x'
  // If adding keys, all maps will possibly need filters before map, to remove

};

if (process.env.ENABLE_UNSAFE_PIPE_CMDS) {
  console.warn('!!!!!!!!!!!!!WARNING!!!!!!!!!!!!!!!!!!');
  console.warn('ENABLE_UNSAFE_PIPE_CMDS IS ENABLED');
  console.warn('DO NOT RUN EXTRACTORS FROM UNTRUSTED SOURCES');
  console.warn('THEY HAVE ACCESS TO THE JS ENVIRONMENT AND SHELL SCRIPT EXECUTION');
  console.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
} // New format needed or at least beneficial shorthand for arr in arr?
// ["$ tr", ["$ td | text"]]
// [{$:"tr", _v: ["$ td"]}]
// [{$:"tr", _v: [{$:"td", _v: "text"}]}]
// NOTE fb55 select works as follows: If single element context, query children, else query from list. At least it says so on page.
// "elems can be either an array of elements, or a single element. If it is an element, its children will be queried."
// FIXME inject initialized engine instead (counterpoint: advanced extractors may want to switch engines)


function pick(engineInitObject, extractorDocument, options = {
  engine: 'Fb55'
}) {
  const engine = ENGINES[options.engine];
  debug(engine);
  const initialContext = engine.init(engineInitObject);
  const meta = {
    engine
  };
  return descend(initialContext, extractorDocument, meta, 0);
}

function descend(_context, _extractorFrag, meta, i) {
  debug(`^---------------------{ ${i} }------------------------------`);
  debug(`INPUT FRAGMENT \t ${(0, _jsonStringifySafe.default)(_extractorFrag)}`);
  debug(`INPUT CONTEXT \t ${(0, _jsonStringifySafe.default)(_context.map(_it => {
    return _it.name;
  }))}`);
  debug(`INPUT META \t ${(0, _jsonStringifySafe.default)({ ...(0, _omit2.default)(meta, 'engine'),
    ...(0, _mapValues2.default)(meta.engine, prop => (0, _isFunction2.default)(prop) ? '[Function]' : prop)
  })}`); // stringify ignores functions

  debug(`INPUT SPECIAL KEYS: ${Object.keys((0, _isArray2.default)(_extractorFrag) ? _extractorFrag[0] : _extractorFrag).filter(key => {
    return Object.values(SPECIAL_KEYS).indexOf(key) != -1;
  })}`);
  const $ = meta.engine.select;
  /*
  Strip brackets:
   If [wrapped], remove wrapping and save the information about multiselection in shouldSelectMulti
  */

  const shouldSelectMulti = (0, _isArray2.default)(_extractorFrag);
  const extractorFrag = shouldSelectMulti ? _extractorFrag[0] : _extractorFrag;
  /*
  Pre-modify context:
   If key present:
    Modify the context before anything else
    Strip the key as the effects have been applied
    Then, run from the top
    If multi [should produce an array]:
     Run with each element in selection as the context, with same extractorFrag
    else
     Run with new context, with same extractorFrag
  */

  const shouldPreModifyContext = (0, _has2.default)(extractorFrag, SPECIAL_KEYS.PRE);
  const context = shouldPreModifyContext ? $(extractorFrag[SPECIAL_KEYS.PRE], _context) : _context;
  const extractorFragStripped = (0, _omit2.default)(extractorFrag, SPECIAL_KEYS.PRE); // If  context modifier is idempotent
  // extractorFrag being an Object is implied by having keys. needs checks to prevent shit like [[arrays]] and strings with keys

  if (shouldPreModifyContext) {
    if (!(0, _isObject2.default)(extractorFrag)) throw new Error('Non-object with special key', extractorFrag);
    debug(' Premodify context, recurse');

    if (shouldSelectMulti) {
      debug(`  Multiselection, sub-contexts: ${context.map(_it2 => {
        return _it2.name;
      })}`);
      return context.map(subContext => descend([subContext], extractorFragStripped, meta, i));
    } else {
      debug(`  Single selection, recursing`);
      return descend([context[0]], extractorFragStripped, meta, i); // FIXME is this reasonable? $ selects first unless []
    }
  }
  /*
  Value extraction:
   String -> pipeline
   Callable -> apply FIXME check so not isMulti, this is invalid syntax
   Object/Array -> descend (fallthrough behaviour)
   Otherwise:
   Has SPECIAL_KEYS.VALUE -> descend on that
   Else descend on all own keys
   No need to worry about SPECIAL_KEYS.PRE being present. That causes context mod/strip/recursion above
  */


  debug('Value extraction');

  if ((0, _isString2.default)(extractorFrag)) {
    debug(' String', context.map(_it3 => {
      return _it3.name;
    }));

    if (shouldSelectMulti) {
      return new _Pipeline.default(extractorFrag, { ...meta,
        shouldSelectMulti
      }).exec(context);
    } else {
      return new _Pipeline.default(extractorFrag, { ...meta,
        shouldSelectMulti
      }).exec(context[0]);
    }
  } // pipeline MULTI needs switch that changes $ to $$ in first block
  else if ((0, _isFunction2.default)(extractorFrag)) {
      return extractorFrag($, context, meta);
    } // user-defined function MULTI makes no sense
    else if ((0, _isObject2.default)(extractorFrag)) {
        debug(' Object'); // possibly merge these. First do extractorFrag[SPECIAL_KEYS.VALUE], then strip it and run the rest of the keys

        const hasValueExtractorKey = (0, _has2.default)(extractorFrag, SPECIAL_KEYS.VALUE);

        if (hasValueExtractorKey) {
          debug('  Has value extractor key');

          if (shouldSelectMulti) {
            return context.map(subContext => descend([subContext], extractorFrag[SPECIAL_KEYS.VALUE], meta, i + 1));
          } else {
            return descend(context, extractorFrag[SPECIAL_KEYS.VALUE], meta, i + 1);
          }
        } else {
          debug('  No value extractor key, descend on keys');

          if (shouldSelectMulti) {
            return context.map(subContext => descend([subContext], extractorFrag, meta, i + 1));
          } else {
            return (0, _mapValues2.default)(extractorFrag, (extractorFragFrag, key) => {
              debug(`Descending on key ${key}`);
              return descend(context, extractorFragFrag, meta, i + 1);
            });
          }
        }
      }
}

module.exports = {
  pick
};