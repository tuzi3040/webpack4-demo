"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parse;

var _core = require("@babel/core");

function parse(src, context) {
  try {
    return (0, _core.transform)(src, {
      ast: true,
      babelrc: false,
      configFile: false,
      code: false,
      parserOpts: context.file.parserOpts,
      plugins: [({
        types: t
      }) => {
        return {
          visitor: {
            ReferencedIdentifier(path) {
              const node = path.node,
                    scope = path.scope;
              const name = node.name,
                    type = node.type;
              if (scope.getBindingIdentifier(name)) return;
              const variable = context.getVariable(name);

              if (variable) {
                path.replaceWith(type === 'JSXIdentifier' ? t.jSXIdentifier(variable.id.name) : variable.id);
              }
            },

            AssignmentExpression(path) {
              if (t.isIdentifier(path.node.left)) {
                const variable = context.getVariable(path.node.left.name);

                if (variable) {
                  if (variable.kind === 'const') {
                    const err = context.error('CONSTANT_VARIABLE_MUTATION', `You cannot update "${path.node.left.name}" because it is constant`);
                    throw err;
                  }

                  path.get('left').replaceWith(variable.id);
                }
              }
            },

            UpdateExpression(path) {
              if (t.isIdentifier(path.node.argument)) {
                const variable = context.getVariable(path.node.argument.name);

                if (variable && variable.kind === 'const') {
                  const err = context.error('CONSTANT_VARIABLE_MUTATION', `You cannot update "${path.node.argument.name}" because it is constant`);
                  throw err;
                }
              }
            }

          }
        };
      }]
    }).ast.program.body;
  } catch (ex) {
    const err = context.error('JS_SYNTAX_ERROR', ex.message.replace(/^unknown\: /, ''));
    throw err;
  }
}