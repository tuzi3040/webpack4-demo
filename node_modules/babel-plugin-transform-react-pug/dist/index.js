"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _commonPrefix = _interopRequireDefault(require("common-prefix"));

var _parsePug = _interopRequireDefault(require("./parse-pug"));

var _context = _interopRequireDefault(require("./context"));

var _visitors = require("./visitors");

var _interpolation = require("./utils/interpolation");

var _jsx = require("./utils/jsx");

var _babelTypes = require("./lib/babel-types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const DEFAULT_OPTIONS = {
  classAttribute: 'className'
};

function _default(babel) {
  const t = babel.types;
  (0, _babelTypes.setBabelTypes)(t);

  function isReactPugReference(node) {
    // TODO: do this better
    return t.isIdentifier(node, {
      name: 'pug'
    });
  }

  return {
    visitor: {
      TaggedTemplateExpression(path, state) {
        const node = path.node;
        const _node$quasi = node.quasi,
              quasis = _node$quasi.quasis,
              expressions = _node$quasi.expressions;

        if (isReactPugReference(node.tag) && quasis.length >= 1) {
          let template, interpolationRef;

          if (expressions.length) {
            const interpolatedTpl = (0, _interpolation.getInterpolatedTemplate)(quasis, expressions);
            template = interpolatedTpl.template;
            interpolationRef = interpolatedTpl.interpolationRef;
          } else {
            template = quasis[0].value.raw;
          }

          let src = template.split('\n');
          const minIndent = (0, _commonPrefix.default)(src.filter(line => line.trim() !== '').map(line => /^[ \t]*/.exec(line)[0]));
          src = src.map(line => line.substr(minIndent.length)).join('\n');
          const ast = (0, _parsePug.default)(src);

          const context = _context.default.create(this.file, path, interpolationRef, {
            options: _objectSpread({}, DEFAULT_OPTIONS, state.opts)
          });

          const transformed = ast.nodes.map(node => (0, _visitors.visitExpression)(node, context));
          const expression = transformed.length === 1 ? transformed[0] : (0, _jsx.buildJSXFragment)(transformed);
          context.variablesToDeclare.forEach(id => {
            path.scope.push({
              kind: 'let',
              id
            });
          });
          path.replaceWith(expression);
        }
      }

    }
  };
}