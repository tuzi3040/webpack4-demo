"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _parseExpression = _interopRequireDefault(require("../utils/parse-expression"));

var _jsx = require("../utils/jsx");

var _babelTypes = _interopRequireDefault(require("../lib/babel-types"));

var _visitors = require("../visitors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function convertCases(nodes, context, needle) {
  if (nodes.length === 0) {
    return _babelTypes.default.identifier('null');
  }

  const node = nodes[0];
  const consequent = context.staticBlock(childContext => {
    const children = (0, _visitors.visitExpressions)(node.block.nodes, childContext);

    if (children.length === 1) {
      return children[0];
    }

    if (children.length === 0) {
      return _babelTypes.default.identifier('null');
    }

    return (0, _jsx.buildJSXFragment)(children);
  });

  if (node.expr === 'default') {
    return consequent;
  }

  const test = _babelTypes.default.binaryExpression('===', needle, (0, _parseExpression.default)(node.expr, context));

  const alternate = convertCases(nodes.slice(1), context, needle);
  return _babelTypes.default.conditionalExpression(test, consequent, alternate);
}

const ConditionalVisitor = {
  expression(node, context) {
    const needle = (0, _parseExpression.default)(node.expr, context);
    const id = _babelTypes.default.asIdentifier(needle) || context.declareVariable('const', context.generateUidIdentifier('case_variable').name).id;
    const cases = convertCases(node.block.nodes, context, id);

    if (!_babelTypes.default.isIdentifier(needle)) {
      return _babelTypes.default.sequenceExpression([_babelTypes.default.assignmentExpression('=', id, needle), cases]);
    }

    return cases;
  }

};
var _default = ConditionalVisitor;
exports.default = _default;