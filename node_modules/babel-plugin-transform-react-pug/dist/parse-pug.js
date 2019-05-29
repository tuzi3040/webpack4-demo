"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _pugLexer = _interopRequireDefault(require("pug-lexer"));

var _pugParser = _interopRequireDefault(require("pug-parser"));

var _pugFilters = _interopRequireDefault(require("pug-filters"));

var _pugStripComments = _interopRequireDefault(require("pug-strip-comments"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(str) {
  return _pugFilters.default.handleFilters((0, _pugParser.default)((0, _pugStripComments.default)((0, _pugLexer.default)(str), {
    stripUnbuffered: true,
    stripBuffered: true
  })));
}