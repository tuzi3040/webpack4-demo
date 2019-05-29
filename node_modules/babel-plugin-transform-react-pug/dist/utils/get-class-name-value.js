"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _babelTypes = _interopRequireDefault(require("../lib/babel-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPlainShorthandValue(classes) {
  if (classes.length) {
    return classes.map(item => item.value).filter(Boolean).join(' ');
  }

  return null;
}

function getPlainClassNameValue(classes) {
  if (classes.every(item => _babelTypes.default.isStringLiteral(item))) {
    return classes.map(item => item.value).filter(Boolean).join(' ');
  }

  if (classes.every(item => _babelTypes.default.isArrayExpression(item))) {
    return classes.reduce((all, item) => all.concat(item.elements), []);
  }

  if (Array.isArray(classes)) {
    return classes[0];
  }

  return null;
}

function mergeStringWithClassName(shorthand, attribute) {
  // There are several branches:
  // - when attribute exists
  // - when shorthand only exists
  // - otherwise
  if (attribute) {
    if (typeof attribute === 'string') {
      if (shorthand) {
        return _babelTypes.default.stringLiteral(shorthand + ' ' + attribute);
      }

      return _babelTypes.default.stringLiteral(attribute);
    }

    if (Array.isArray(attribute)) {
      if (shorthand) {
        return _babelTypes.default.jSXExpressionContainer(_babelTypes.default.arrayExpression([_babelTypes.default.stringLiteral(shorthand)].concat(attribute)));
      }

      return _babelTypes.default.jSXExpressionContainer(_babelTypes.default.arrayExpression(attribute));
    }

    if (shorthand) {
      return _babelTypes.default.jSXExpressionContainer(_babelTypes.default.binaryExpression('+', _babelTypes.default.stringLiteral(shorthand + ' '), attribute));
    }

    return _babelTypes.default.jSXExpressionContainer(attribute);
  }

  if (shorthand) {
    if (typeof shorthand === 'string') {
      return _babelTypes.default.stringLiteral(shorthand);
    }

    return _babelTypes.default.jSXExpressionContainer(shorthand);
  }

  return null;
}

function getClassNameValue(classesViaShorthand, classesViaAttribute) {
  const shorthandValue = getPlainShorthandValue(classesViaShorthand);
  const attributeValue = getPlainClassNameValue(classesViaAttribute);
  return mergeStringWithClassName(shorthandValue, attributeValue);
}

var _default = getClassNameValue;
exports.default = _default;