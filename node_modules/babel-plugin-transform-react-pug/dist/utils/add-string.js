"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addString;

var _babelTypes = _interopRequireDefault(require("../lib/babel-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addString(node, rStr) {
  _babelTypes.default.assertStringLiteral(rStr);

  const lStr = _babelTypes.default.asStringLiteral(node);

  if (lStr) {
    return _babelTypes.default.stringLiteral(lStr.value + rStr.value);
  }

  const lBinary = _babelTypes.default.asBinaryExpression(node, {
    operator: '+'
  });

  if (lBinary) {
    const lStr = _babelTypes.default.asStringLiteral(lBinary.right);

    if (lStr) {
      return _babelTypes.default.binaryExpression('+', lBinary.left, addString(lStr, rStr));
    }
  }

  return _babelTypes.default.binaryExpression('+', node, rStr);
}