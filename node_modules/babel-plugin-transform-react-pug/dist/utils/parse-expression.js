"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseExpression;

var _parse = _interopRequireDefault(require("./parse"));

var _addLocToAst = _interopRequireDefault(require("./add-loc-to-ast"));

var _babelTypes = _interopRequireDefault(require("../lib/babel-types"));

var _interpolation = require("./interpolation");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseExpression(src, context) {
  if ((0, _interpolation.getInterpolationRefs)(src)) {
    const matched = src.split(_interpolation.INTERPOLATION_REFERENCE_REGEX);
    const isInterpolation = matched.every(text => text === '');

    if (!isInterpolation) {
      const errMsg = matched.length === 1 ? `Interpolation does not exist` : `Only an interpolation can be specified. You may want to remove ${matched.join(' ')}.`;
      throw context.error('INVALID_EXPRESSION', errMsg);
    }

    const interpolation = context.getInterpolationByRef(src);

    if (interpolation == null) {
      throw context.error('INVALID_EXPRESSION', `Interpolation does not exist for ${src}`);
    }

    return interpolation;
  }

  const val = (0, _parse.default)('x = (' + src + ');', context);

  if (val.length !== 1) {
    const err = context.error('INVALID_EXPRESSION', `There was an error parsing the expression ${src}.`);
    throw err;
  }

  const expressionStatement = _babelTypes.default.asExpressionStatement(val[0]);

  const assignmentExpression = expressionStatement && _babelTypes.default.asAssignmentExpression(expressionStatement.expression);

  if (!assignmentExpression) {
    const err = context.error('INVALID_EXPRESSION', `There was an error parsing the expression ${src}.`);
    throw err;
  }

  (0, _addLocToAst.default)(assignmentExpression);
  return assignmentExpression.right;
}