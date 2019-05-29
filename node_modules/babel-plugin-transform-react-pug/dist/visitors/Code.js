"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _parseExpression = _interopRequireDefault(require("../utils/parse-expression"));

var _parseStatement = _interopRequireDefault(require("../utils/parse-statement"));

var _babelTypes = _interopRequireDefault(require("../lib/babel-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function visitBufferedCode(node, context) {
  return (0, _parseExpression.default)(node.val, context);
}

function declareProperty(kind, prop, context) {
  switch (prop.type) {
    case 'RestElement':
      return _objectSpread({}, prop, {
        argument: declareLVal(kind, prop.argument, context)
      });

    case 'ObjectProperty':
      return _objectSpread({}, prop, {
        value: prop.value && declareLVal(kind, prop.value, context)
      });

    default:
      throw new Error('Unexpected Property Type, ' + prop.type);
  }
}

function declareLVal(kind, val, context) {
  switch (val.type) {
    case 'ArrayPattern':
      return _objectSpread({}, val, {
        elements: val.elements.map(el => declareLVal(kind, el, context))
      });

    case 'Identifier':
      return context.declareVariable(kind, val.name).id;

    case 'ObjectPattern':
      return _objectSpread({}, val, {
        properties: val.properties.map(p => declareProperty(kind, p, context))
      });

    case 'RestElement':
      return _objectSpread({}, val, {
        argument: declareLVal(kind, val.argument, context)
      });

    default:
      throw new Error('Unexpected Left Value Type, ' + val.type);
  }
}

function visitUnbufferedCode(node, context) {
  // TODO: hoist and rename `const` and `let` variables
  const statement = (0, _parseStatement.default)(node.val, context);

  const variableDeclaration = _babelTypes.default.asVariableDeclaration(statement);

  if (variableDeclaration) {
    const kind = variableDeclaration.kind;
    const expressions = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = variableDeclaration.declarations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        const declaration = _step.value;
        const lval = declareLVal(kind, declaration.id, context);
        expressions.push(_babelTypes.default.assignmentExpression('=', lval, declaration.init || _babelTypes.default.identifier('undefined')));
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    expressions.push(_babelTypes.default.identifier('null'));
    return _babelTypes.default.sequenceExpression(expressions);
  }

  if (_babelTypes.default.isExpressionStatement(statement)) {
    return _babelTypes.default.sequenceExpression([statement.expression, _babelTypes.default.identifier('null')]);
  }

  return _babelTypes.default.callExpression(_babelTypes.default.arrowFunctionExpression([], _babelTypes.default.blockStatement([statement])), []);
}

const CodeVisitor = {
  expression(node, context) {
    if (node.buffer && !node.mustEscape) {
      throw new Error('Unescaped, buffered code is not supported in react-pug');
    }

    if (node.buffer) {
      return visitBufferedCode(node, context);
    } else {
      return visitUnbufferedCode(node, context);
    }
  }

};
var _default = CodeVisitor;
exports.default = _default;