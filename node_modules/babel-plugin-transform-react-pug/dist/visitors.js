"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.visitExpressions = visitExpressions;
exports.visitExpression = visitExpression;
exports.visitJsxExpressions = visitJsxExpressions;
exports.visitJsx = visitJsx;

var _babelTypes = _interopRequireWildcard(require("./lib/babel-types"));

var _visitors = _interopRequireDefault(require("./lib/visitors.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function visitExpressions(nodes, context) {
  const result = [];
  nodes.forEach((node, i) => {
    if (node.type === 'Block') {
      result.push(...visitExpressions(node.nodes, context));
    } else {
      result.push(visitExpression(node, context));
    }
  });
  return result;
}

function visitExpression(node, context) {
  const line = node.line + context.getBaseLine();
  (0, _babelTypes.setCurrentLocation)({
    start: {
      line,
      column: 0
    },
    end: {
      line,
      column: 0
    }
  });
  const v = _visitors.default[node.type];

  if (!v) {
    throw new Error(node.type + ' is not yet supported');
  }

  return v.expression(node, context);
}

function visitJsxExpressions(nodes, context) {
  const result = [];
  nodes.forEach((node, i) => {
    if (node.type === 'Block') {
      result.push(...visitJsxExpressions(node.nodes, context));
    } else {
      result.push(visitJsx(node, context));
    }
  });
  return result;
}

function visitJsx(node, context) {
  const line = node.line + context.getBaseLine();
  (0, _babelTypes.setCurrentLocation)({
    start: {
      line,
      column: 0
    },
    end: {
      line,
      column: 0
    }
  });
  const v = _visitors.default[node.type];

  if (!v) {
    throw new Error(node.type + ' is not yet supported');
  }

  return v.jsx ? v.jsx(node, context) : _babelTypes.default.jSXExpressionContainer(v.expression(node, context));
}