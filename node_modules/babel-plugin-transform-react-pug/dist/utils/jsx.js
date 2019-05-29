"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildJSXElement = buildJSXElement;
exports.buildJSXFragment = buildJSXFragment;

var _babelTypes = _interopRequireDefault(require("../lib/babel-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildJSXElement(tag, attrs, children) {
  const noChildren = children.length === 0;

  const open = _babelTypes.default.jSXOpeningElement(tag, attrs, noChildren);

  const close = noChildren ? null : _babelTypes.default.jSXClosingElement(tag);
  return _babelTypes.default.jSXElement(open, close, children, noChildren);
}

const isAllowedChild = item => ['JSXText', 'JSXExpressionContainer', 'JSXSpreadChild', 'JSXElement'].includes(item.type); // TODO: This can be replaced when migrating to Babel 7 as JSXFragment
// has been added in v7.0.0-beta.30.


function buildJSXFragment(children) {
  const fragmentExpression = _babelTypes.default.jSXMemberExpression(_babelTypes.default.jSXIdentifier('React'), _babelTypes.default.jSXIdentifier('Fragment'));

  const jSXChildren = children.map(item => {
    if (!isAllowedChild(item)) {
      if (item.type === 'StringLiteral') {
        return _babelTypes.default.jSXText(item.value);
      }

      return _babelTypes.default.jSXExpressionContainer(item);
    }

    return item;
  });
  return buildJSXElement(fragmentExpression, [], jSXChildren);
}