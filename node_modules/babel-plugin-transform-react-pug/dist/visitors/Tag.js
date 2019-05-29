"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _parseExpression = _interopRequireDefault(require("../utils/parse-expression"));

var _babelTypes = _interopRequireDefault(require("../lib/babel-types"));

var _visitors = require("../visitors");

var _interpolation = require("../utils/interpolation");

var _jsx = require("../utils/jsx");

var _getClassNameValue = _interopRequireDefault(require("../utils/get-class-name-value"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get children nodes from the node, passing the node's
 * context to the children and generating JSX values.
 * @param {Object} node - The node
 * @param {Context} context - The context to apply to the children
 * nodes
 * @returns {Array<JSXValue>}
 */
function getChildren(node, context) {
  return context.noKey(childContext => (node.code ? [(0, _visitors.visitJsx)(node.code, childContext)] : []).concat((0, _visitors.visitJsxExpressions)(node.block.nodes, childContext)));
}
/**
 * Iterate through the node's attributes and convert
 * them into JSX attributes.
 * @param {Object} node - The node
 * @param {Context} context - The context
 * @returns {Array<Attribute>}
 */


function getAttributes(node, context) {
  const classesViaAttribute = [];
  const classesViaShorthand = [];
  const attrs = node.attrs.map(({
    name,
    val,
    mustEscape
  }) => {
    if (/\.\.\./.test(name) && val === true) {
      return _babelTypes.default.jSXSpreadAttribute((0, _parseExpression.default)(name.substr(3), context));
    } // TODO: Need to drop all aliases for attributes


    switch (name) {
      case 'for':
        name = 'htmlFor';
        break;

      case 'maxlength':
        name = 'maxLength';
        break;
    }

    const expr = (0, _parseExpression.default)(String(val), context);

    if (!mustEscape) {
      const canSkipEscaping = (name === 'class' || name === 'id') && _babelTypes.default.isStringLiteral(expr);

      if (!canSkipEscaping) {
        throw context.error('INVALID_EXPRESSION', 'Unescaped attributes are not supported in react-pug');
      }
    }

    if (expr == null) {
      return null;
    }

    if (name === 'class') {
      if (!_babelTypes.default.isStringLiteral(expr)) {
        throw context.error('INVALID_EXPRESSION', `We can't use expressions in shorthands, use "${context._options.classAttribute}" instead of "class"`);
      }

      classesViaShorthand.push(expr);
      return null;
    }

    if (name === context._options.classAttribute) {
      classesViaAttribute.push(expr);
      return null;
    }

    const jsxValue = _babelTypes.default.asStringLiteral(expr) || _babelTypes.default.asJSXElement(expr) || _babelTypes.default.jSXExpressionContainer(expr);

    if (/\.\.\./.test(name)) {
      throw new Error('spread attributes must not have a value');
    }

    return _babelTypes.default.jSXAttribute(_babelTypes.default.jSXIdentifier(name), jsxValue);
  }).filter(Boolean);

  if (classesViaShorthand.length || classesViaAttribute.length) {
    const value = (0, _getClassNameValue.default)(classesViaShorthand, classesViaAttribute);
    attrs.push(_babelTypes.default.jSXAttribute(_babelTypes.default.jSXIdentifier(context._options.classAttribute), value));
  }

  return attrs;
}
/**
 * Retrieve attributes and children of the passed node.
 * @param {Object} node - The node
 * @param {Context} context - The context
 * @returns {Object} Contains the attributes and children
 * of the node.
 */


function getAttributesAndChildren(node, context) {
  const children = getChildren(node, context);

  if (node.attributeBlocks.length) {
    throw new Error('Attribute blocks are not yet supported in react-pug');
  }

  const attrs = getAttributes(node, context);
  context.key.handleAttributes(attrs);
  return {
    attrs,
    children
  };
}
/**
 * Check whether an interpolation exists, if so, check whether
 * the interpolation is a react component and return either
 * the component as a JSX element or the interpolation.
 * @param {string} name - The interpolation reference
 * @param {Context} context - The current context to retrieve
 * the interpolation from
 * @param {Array<JSXValue>} children - Whether the element has
 * attributes or children
 * @returns {?Object} The context's interpolation or a JSX element.
 */


function getInterpolationByContext(name, context, attrs, children) {
  if (!(0, _interpolation.getInterpolationRefs)(name)) {
    return null;
  }

  const interpolation = context.getInterpolationByRef(name);
  const isReactComponent = _babelTypes.default.isIdentifier(interpolation) && interpolation.name.charAt(0) === interpolation.name.charAt(0).toUpperCase();

  if (attrs.length || children.length) {
    if (isReactComponent) {
      return (0, _jsx.buildJSXElement)(_babelTypes.default.jSXIdentifier(interpolation.name), attrs, children);
    } else {
      throw context.error('INVALID_EXPRESSION', `Only components can have children and attributes`);
    }
  }

  return interpolation;
}

const TagVisitor = {
  jsx(node, context) {
    const _getAttributesAndChil = getAttributesAndChildren(node, context),
          attrs = _getAttributesAndChil.attrs,
          children = _getAttributesAndChil.children;

    const interpolation = getInterpolationByContext(node.name, context, attrs, children);

    if (interpolation != null) {
      return _babelTypes.default.asJSXElement(interpolation) || _babelTypes.default.jSXExpressionContainer(interpolation);
    }

    return (0, _jsx.buildJSXElement)(_babelTypes.default.jSXIdentifier(node.name), attrs, children);
  },

  expression(node, context) {
    const _getAttributesAndChil2 = getAttributesAndChildren(node, context),
          attrs = _getAttributesAndChil2.attrs,
          children = _getAttributesAndChil2.children;

    const interpolation = getInterpolationByContext(node.name, context, attrs, children);

    if (interpolation != null) {
      return interpolation;
    }

    return (0, _jsx.buildJSXElement)(_babelTypes.default.jSXIdentifier(node.name), attrs, children);
  }

};
var _default = TagVisitor;
exports.default = _default;