"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseStatement;

var _parse = _interopRequireDefault(require("./parse"));

var _addLocToAst = _interopRequireDefault(require("./add-loc-to-ast"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @noflow
function parseStatement(src, context) {
  const val = (0, _parse.default)(src, context);

  if (val.length !== 1) {
    const err = context.error('INVALID_EXPRESSION', 'There was an error parsing the expression "' + src + '".');
    throw err;
  }

  (0, _addLocToAst.default)(val[0]);
  return val[0];
}