"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unwindThen = unwindThen;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var t = _interopRequireWildcard(require("@babel/types"));

var _getPreceedingLink = _interopRequireDefault(require("./getPreceedingLink"));

var _builders = require("./builders");

var _predicates = require("./predicates");

var _renameBoundIdentifiers = _interopRequireDefault(require("./renameBoundIdentifiers"));

var _hasMutableIdentifiers = _interopRequireDefault(require("./hasMutableIdentifiers"));

var _prependBodyStatement3 = _interopRequireDefault(require("./prependBodyStatement"));

var _replaceLink = _interopRequireDefault(require("./replaceLink"));

var _convertConditionalReturns = _interopRequireDefault(require("./convertConditionalReturns"));

function unwindThen(handler) {
  var link = handler.parentPath;
  var preceeding = (0, _builders.awaited)((0, _getPreceedingLink["default"])(link).node);

  if ((0, _predicates.isNullish)(handler.node)) {
    return (0, _replaceLink["default"])(link, preceeding);
  }

  if (handler.isFunction()) {
    var handlerFunction = handler;
    var input = handlerFunction.get('params')[0];
    var body = handlerFunction.get('body');

    if (body.isBlockStatement() && !(0, _convertConditionalReturns["default"])(body)) {
      return (0, _replaceLink["default"])(link, t.callExpression(handler.node, [preceeding]));
    }

    if (input) (0, _renameBoundIdentifiers["default"])(input, link.scope);
    var kind = input && (0, _hasMutableIdentifiers["default"])(input) ? 'let' : 'const';
    var inputNode = input === null || input === void 0 ? void 0 : input.node;
    if (input) input.remove();

    var _prependBodyStatement = (0, _prependBodyStatement3["default"])(handler, inputNode && !(0, _predicates.isNullish)(inputNode) ? t.variableDeclaration(kind, [t.variableDeclarator(inputNode, preceeding)]) : t.expressionStatement(preceeding)),
        _prependBodyStatement2 = (0, _slicedToArray2["default"])(_prependBodyStatement, 1),
        prepended = _prependBodyStatement2[0];

    if (prepended.isVariableDeclaration()) {
      prepended.scope.registerBinding(prepended.node.kind, prepended.get('declarations.0.id'));
    }

    return (0, _replaceLink["default"])(link, handlerFunction.get('body'));
  }

  return (0, _replaceLink["default"])(link, t.callExpression(handler.node, [preceeding]));
}