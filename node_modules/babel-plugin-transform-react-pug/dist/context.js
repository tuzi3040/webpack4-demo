"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = require("fs");

var _pugError = _interopRequireDefault(require("pug-error"));

var _babelTypes = require("./lib/babel-types");

var _blockKey = require("./block-key");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Context {
  constructor(params) {
    _defineProperty(this, "key", void 0);

    _defineProperty(this, "file", void 0);

    _defineProperty(this, "path", void 0);

    _defineProperty(this, "_variables", new Map());

    _defineProperty(this, "variablesToDeclare", []);

    _defineProperty(this, "_nextBlockID", 0);

    _defineProperty(this, "_parent", void 0);

    _defineProperty(this, "_interpolations", void 0);

    _defineProperty(this, "_options", void 0);

    if (!params.definesScope && params.parent) {
      this.variablesToDeclare = params.parent.variablesToDeclare;
    }

    this._parent = params.parent;
    this.key = params.key;
    this.file = params.file;
    this.path = params.path;
    this._interpolations = params.interpolations;
    this._options = params.options;
  }

  error(code, message) {
    const options = {
      filename: this.file.opts.filename,
      line: (0, _babelTypes.getCurrentLocation)().start.line - 1,
      src: null
    };

    if ((0, _fs.existsSync)(options.filename)) {
      options.src = (0, _fs.readFileSync)(this.file.opts.filename, 'utf8');
    }

    return (0, _pugError.default)(code, message, options);
  }

  noKey(fn) {
    const childContext = new Context({
      definesScope: false,
      key: new _blockKey.BaseKey(),
      parent: this,
      file: this.file,
      path: this.path,
      options: this._options
    });
    const result = fn(childContext);
    childContext.end();
    return result;
  }

  staticBlock(fn) {
    const childContext = new Context({
      definesScope: false,
      key: new _blockKey.StaticBlock(this.key, this._nextBlockID++),
      parent: this,
      file: this.file,
      path: this.path,
      options: this._options
    });
    const result = fn(childContext);
    childContext.end();
    return result;
  }

  dynamicBlock(fn) {
    const childContext = new Context({
      definesScope: true,
      key: new _blockKey.DynamicBlock(this.key, 'src', 0),
      parent: this,
      file: this.file,
      path: this.path,
      options: this._options
    });
    const result = fn(childContext);
    childContext.end();
    return {
      result,
      variables: childContext.variablesToDeclare
    };
  }

  end() {
    this.key.end();
  }

  getVariable(name) {
    const variable = this._variables.get(name);

    if (variable) {
      return variable;
    }

    if (this._parent) {
      return this._parent.getVariable(name);
    } // TODO: maybe actually verify existance/non-const in parent scope?


    return null;
  }

  declareVariable(kind, name) {
    if (typeof name !== 'string') {
      throw new Error('variables may only be declared with strings');
    }

    const oldVariable = this._variables.get(name);

    if (oldVariable) {
      if (oldVariable.kind !== 'var' || kind !== 'var') {
        const err = this.error('DUPLICATE_VARIABLE', `Duplicate variable ${name}.`);
        throw err;
      }

      return oldVariable;
    }

    const variable = {
      kind,
      id: this.generateUidIdentifier(name)
    };
    this.variablesToDeclare.push(variable.id);

    this._variables.set(name, variable);

    return variable;
  }

  generateUidIdentifier(name) {
    return this.path.scope.generateUidIdentifier(name);
  }

  getBaseLine() {
    return this.path.node.loc.start.line;
  }
  /**
   * Check whether interpolations exist for the context, if not,
   * recursively check the parent context for the interpolation.
   * @param { String } reference - The interpolation reference
   * @returns { ?Expression } The interpolation or nothing.
   */


  getInterpolationByRef(reference) {
    let interpolation = null;

    if (this._interpolations && (interpolation = this._interpolations.get(reference))) {
      return interpolation;
    } else if (this._parent) {
      return this._parent.getInterpolationByRef(reference);
    }

    return this.getInterpolationByRef(reference);
  }

  static create(file, path, interpolations, params) {
    return new Context({
      definesScope: true,
      key: new _blockKey.BaseKey(),
      parent: null,
      file,
      path,
      options: params.options,
      interpolations
    });
  }

}

var _default = Context;
exports.default = _default;