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

// [ "JSXExpressionContainer", "ConditionalExpression", "IfStatement" ]
const ConditionalVisitor = {
  expression(node, context) {
    if (node.alternate && node.alternate.type === 'Conditional') {
      node.alternate = {
        nodes: [node.alternate]
      };
    }

    const test = (0, _parseExpression.default)(node.test, context);
    const consequent = context.staticBlock(childContext => {
      const children = (0, _visitors.visitExpressions)(node.consequent.nodes, childContext);

      if (children.length === 1) {
        return children[0];
      }

      if (children.length === 0) {
        return _babelTypes.default.identifier('null');
      }

      return (0, _jsx.buildJSXFragment)(children);
    });
    const alternate = context.staticBlock(childContext => {
      const children = (0, _visitors.visitExpressions)(node.alternate ? node.alternate.type === 'Conditional' ? [node.alternate] : node.alternate.nodes : [], childContext);

      if (children.length === 1) {
        return children[0];
      }

      if (children.length === 0) {
        return _babelTypes.default.identifier('null');
      }

      return (0, _jsx.buildJSXFragment)(children);
    });
    return _babelTypes.default.conditionalExpression(test, consequent, alternate);
  }

};
var _default = ConditionalVisitor;
exports.default = _default;