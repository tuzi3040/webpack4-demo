"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _babelTypes = _interopRequireDefault(require("../lib/babel-types"));

var _sanitizeText = _interopRequireDefault(require("../utils/sanitize-text"));

var _interpolation = require("../utils/interpolation");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Find interpolation references in the text
 * and interweave the text with interpolations.
 * @param {string} value - The value to interpolate
 * @param {Array<string>} refs - The array of references
 * @param {Context} context - The context of the expression.
 * @returns {Expression} The interpolation or an array containing
 * text and interpolations.
 */
function buildInterpolation(value, refs, context) {
  const splitText = value.split(_interpolation.INTERPOLATION_REFERENCE_REGEX);

  if (refs.length === 1 && splitText.every(text => text === '')) {
    const ref = context.getInterpolationByRef(refs[0]);
    return ref || _babelTypes.default.nullLiteral();
  }

  const textArr = splitText.reduce((arr, value, index) => {
    const valueArr = value ? [_babelTypes.default.stringLiteral(value)] : [];
    const interpolation = refs[index] ? context.getInterpolationByRef(refs[index]) : null;

    if (interpolation) {
      valueArr.push(interpolation);
    }

    return arr.concat(valueArr);
  }, []);
  return _babelTypes.default.callExpression(_babelTypes.default.memberExpression(_babelTypes.default.arrayExpression(textArr), _babelTypes.default.identifier('join')), [_babelTypes.default.stringLiteral('')]);
}

const TextVisitor = {
  jsx({
    val
  }, context) {
    const refs = (0, _interpolation.getInterpolationRefs)(val);

    if (refs) {
      const expr = buildInterpolation(val, refs, context);
      return _babelTypes.default.jSXExpressionContainer(expr);
    }

    if (/^\s/.test(val) || /\s$/.test(val)) {
      return _babelTypes.default.jSXExpressionContainer(_babelTypes.default.stringLiteral(val));
    }

    const content = (0, _sanitizeText.default)(val);
    return _babelTypes.default.jSXText(content);
  },

  expression({
    val
  }, context) {
    const refs = (0, _interpolation.getInterpolationRefs)(val);

    if (refs) {
      return buildInterpolation(val, refs, context);
    }

    return _babelTypes.default.stringLiteral(val);
  }

};
var _default = TextVisitor;
exports.default = _default;