"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _parseExpression = _interopRequireDefault(require("../utils/parse-expression"));

var _babelTypes = _interopRequireDefault(require("../lib/babel-types"));

var _visitors = require("../visitors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getWhileStatement(node, context, id) {
  const test = (0, _parseExpression.default)(node.test, context);

  const _context$dynamicBlock = context.dynamicBlock(childContext => {
    return (0, _visitors.visitExpressions)(node.block.nodes, context).map(exp => _babelTypes.default.expressionStatement(_babelTypes.default.assignmentExpression('=', _babelTypes.default.memberExpression(id, _babelTypes.default.memberExpression(id, _babelTypes.default.identifier('length')), true), exp)));
  }),
        body = _context$dynamicBlock.result,
        variables = _context$dynamicBlock.variables;

  if (variables.length) {
    body.unshift(_babelTypes.default.variableDeclaration('let', variables.map(id => _babelTypes.default.variableDeclarator(id))));
  }

  return _babelTypes.default.whileStatement(test, _babelTypes.default.blockStatement(body));
}

const WhileVisitor = {
  expression(node, context) {
    const id = context.generateUidIdentifier('pug_nodes');
    return _babelTypes.default.callExpression(_babelTypes.default.arrowFunctionExpression([id], _babelTypes.default.blockStatement([getWhileStatement(node, context, id), _babelTypes.default.returnStatement(id)])), [_babelTypes.default.arrayExpression([])]);
  }

};
var _default = WhileVisitor;
exports.default = _default;