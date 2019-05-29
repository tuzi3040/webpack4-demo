"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DynamicBlock = exports.StaticBlock = exports.BaseKey = void 0;

var _pugError = _interopRequireDefault(require("pug-error"));

var _babelTypes = _interopRequireDefault(require("./lib/babel-types"));

var _addString = _interopRequireDefault(require("./utils/add-string"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function toJsxValue(e) {
  return _babelTypes.default.asStringLiteral(e) || _babelTypes.default.jSXExpressionContainer(e);
}

class BaseKey {
  getKey(fn) {
    fn(_babelTypes.default.stringLiteral('pug'));
  }

  handleAttributes(attrs) {}

  end() {}

}
/*
 * Static blocks are used for things like if statements, that may become arrays
 * behind the sceens, but that do not actually involve iteration, and therefore
 * do not require the user to manually supply a key.
 */


exports.BaseKey = BaseKey;

class StaticBlock {
  constructor(parent, staticBlockID) {
    _defineProperty(this, "_ended", false);

    _defineProperty(this, "_parentEnded", false);

    _defineProperty(this, "_key", null);

    _defineProperty(this, "_pending", []);

    _defineProperty(this, "_index", 0);

    parent.getKey(parentKey => {
      this._parentEnded = true;
      this._key = (0, _addString.default)(parentKey, _babelTypes.default.stringLiteral(':' + staticBlockID));

      this._update();
    });
  }

  _update() {
    if (this._ended && this._parentEnded) {
      const key = this._key;

      if (!key) {
        throw new Error('Expected key to be an expression');
      }

      while (this._pending.length) {
        this._pending.shift()(key);
      }
    }
  }

  getKey(fn) {
    if (this._pending.indexOf(fn) === -1) {
      const index = this._index++;

      this._pending.push(key => fn((0, _addString.default)(key, _babelTypes.default.stringLiteral(':' + index))));
    }

    this._update();
  }

  handleAttributes(attrs) {}

  end() {
    this._ended = true;

    this._update();
  }

}
/*
 * Dynamic blocks are used for real iteration, we require the user to add a key to
 * at least one element within the array, and then we build keys for all the other
 * elements from that one intial key.
 */


exports.StaticBlock = StaticBlock;

class DynamicBlock {
  constructor(parent, srcForError, lineNumberForError) {
    _defineProperty(this, "_ended", false);

    _defineProperty(this, "_localKey", null);

    _defineProperty(this, "_parentEnded", false);

    _defineProperty(this, "_parentKey", null);

    _defineProperty(this, "_pending", []);

    _defineProperty(this, "_index", 0);

    _defineProperty(this, "_srcForError", void 0);

    _defineProperty(this, "_lineNumberForError", void 0);

    this._srcForError = srcForError;
    this._lineNumberForError = lineNumberForError;
    parent.getKey(parentKey => {
      this._parentEnded = true;
      this._parentKey = parentKey;

      this._update();
    });
  }

  _update() {}

  getKey(fn) {
    if (this._pending.indexOf(fn) === -1) {
      const index = this._index++;

      this._pending.push(key => {
        return fn(key);
      });
    }

    this._update();
  }

  handleAttributes() {}

  end() {
    this._ended = true;

    this._update();
  }

}

exports.DynamicBlock = DynamicBlock;