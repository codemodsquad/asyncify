"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = unwindFinally;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var t = _interopRequireWildcard(require("@babel/types"));

var _builders = require("./builders");

var _getPreceedingLink = _interopRequireDefault(require("./getPreceedingLink"));

var _predicates = require("./predicates");

var _replaceLink = _interopRequireDefault(require("./replaceLink"));

var _replaceReturnStatements = _interopRequireDefault(require("./replaceReturnStatements"));

var _convertBodyToBlockStatement = _interopRequireDefault(require("./convertBodyToBlockStatement"));

var _convertConditionalReturns = _interopRequireDefault(require("./convertConditionalReturns"));

function unwindFinally(handler) {
  var link = handler.parentPath;
  var preceeding = (0, _builders.awaited)((0, _getPreceedingLink["default"])(link).node);

  if ((0, _predicates.isNullish)(handler.node)) {
    return (0, _replaceLink["default"])(link, preceeding);
  }

  if (!handler.isFunction()) {
    var callee = handler.node;

    var _ref = handler.replaceWith(t.arrowFunctionExpression([], t.callExpression(callee, [])));

    var _ref2 = (0, _slicedToArray2["default"])(_ref, 1);

    handler = _ref2[0];
  }

  var handlerFunction = handler;
  var body = handlerFunction.get('body');

  if (body.isBlockStatement() && !(0, _convertConditionalReturns["default"])(body)) {
    return (0, _getPreceedingLink["default"])(link);
  }

  body.replaceWith(t.blockStatement([t.tryStatement(t.blockStatement([t.returnStatement(preceeding)]), null, (0, _replaceReturnStatements["default"])((0, _convertBodyToBlockStatement["default"])(handlerFunction), function (argument) {
    return (0, _predicates.isNullish)(argument) ? null : t.expressionStatement((0, _builders.awaited)(argument));
  }).node)]));
  var finalBody = handlerFunction.get('body');
  finalBody.scope.crawl();
  return (0, _replaceLink["default"])(link, finalBody);
}