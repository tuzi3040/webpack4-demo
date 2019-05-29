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

function getAlternate(node, context) {
  return context.staticBlock(childContext => {
    const children = (0, _visitors.visitExpressions)(node.alternate ? node.alternate.nodes : [], childContext);

    if (children.length === 0) {
      return _babelTypes.default.identifier('null');
    }

    if (children.length === 1) {
      return children[0];
    }

    return (0, _jsx.buildJSXFragment)(children);
  });
}

const getBody = (node, context) => {
  const bodyContent = [];

  const _context$dynamicBlock = context.dynamicBlock(childContext => (0, _visitors.visitExpressions)(node.block.nodes, childContext)),
        result = _context$dynamicBlock.result,
        variables = _context$dynamicBlock.variables;

  if (variables.length) {
    bodyContent.unshift(_babelTypes.default.variableDeclaration('let', variables.map(id => _babelTypes.default.variableDeclarator(id))));
  }

  if (result.length > 1) {
    bodyContent.push(_babelTypes.default.returnStatement(_babelTypes.default.arrayExpression(result)));
  } else {
    bodyContent.push(_babelTypes.default.returnStatement(result[0]));
  }

  return _babelTypes.default.blockStatement(bodyContent);
};

const WhileVisitor = {
  expression(node, context) {
    const bodyArgs = [_babelTypes.default.identifier(node.val)];

    if (node.key) {
      bodyArgs.push(_babelTypes.default.identifier(node.key));
    }

    const list = (0, _parseExpression.default)(node.obj, context);

    const callExpression = _babelTypes.default.callExpression(_babelTypes.default.memberExpression(list, _babelTypes.default.identifier('map')), [_babelTypes.default.arrowFunctionExpression(bodyArgs, getBody(node, context))]);

    if (node.alternate) {
      return _babelTypes.default.conditionalExpression(_babelTypes.default.logicalExpression('&&', _babelTypes.default.callExpression(_babelTypes.default.memberExpression(_babelTypes.default.identifier('Array'), _babelTypes.default.identifier('isArray')), [list]), _babelTypes.default.memberExpression(list, _babelTypes.default.identifier('length'))), callExpression, getAlternate(node, context));
    }

    return callExpression;
  }

};
var _default = WhileVisitor;
exports.default = _default;