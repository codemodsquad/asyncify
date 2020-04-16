"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = unwindCatch;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var t = _interopRequireWildcard(require("@babel/types"));

var _getPreceedingLink = _interopRequireDefault(require("./getPreceedingLink"));

var _predicates = require("./predicates");

var _replaceLink = _interopRequireDefault(require("./replaceLink"));

var _renameBoundIdentifiers = _interopRequireDefault(require("./renameBoundIdentifiers"));

var _unboundIdentifier = _interopRequireDefault(require("./unboundIdentifier"));

var _convertBodyToBlockStatement = _interopRequireDefault(require("./convertBodyToBlockStatement"));

var _mergeCatchIntoFinally = _interopRequireDefault(require("./mergeCatchIntoFinally"));

var _builders = require("./builders");

var _convertConditionalReturns = _interopRequireDefault(require("./convertConditionalReturns"));

function unwindCatch(handler) {
  var link = handler.parentPath;
  var preceeding;

  if (link.node.arguments.length === 2) {
    preceeding = t.awaitExpression(t.callExpression(link.node.callee, [link.node.arguments[0]]));
  } else {
    preceeding = (0, _builders.awaited)((0, _getPreceedingLink["default"])(link).node);
  }

  if ((0, _predicates.isNullish)(handler.node)) {
    return (0, _replaceLink["default"])(link, preceeding);
  }

  if (!handler.isFunction()) {
    var callee = handler.node;

    var _ref = handler.replaceWith(t.arrowFunctionExpression([t.identifier('err')], t.callExpression(callee, [t.identifier('err')])));

    var _ref2 = (0, _slicedToArray2["default"])(_ref, 1);

    handler = _ref2[0];
  }

  var handlerFunction = handler;
  var body = handlerFunction.get('body');

  if (body.isBlockStatement() && !(0, _convertConditionalReturns["default"])(body)) {
    return (0, _getPreceedingLink["default"])(link);
  }

  var input = handlerFunction.get('params')[0];
  if (input) (0, _renameBoundIdentifiers["default"])(input, link.scope);
  var inputNode = input === null || input === void 0 ? void 0 : input.node;
  if (input) input.remove();
  var catchClause = t.catchClause(inputNode || (0, _unboundIdentifier["default"])(handler, 'err'), (0, _convertBodyToBlockStatement["default"])(handlerFunction).node);
  body.replaceWith(t.blockStatement([t.tryStatement(t.blockStatement([t.returnStatement(preceeding)]), catchClause)]));
  var finalBody = handlerFunction.get('body');
  finalBody.scope.crawl();
  var tryStatement = finalBody.get('body')[0];
  var merged = (0, _mergeCatchIntoFinally["default"])(link, tryStatement);
  return merged || (0, _replaceLink["default"])(link, finalBody);
}