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
  handlerFunction.get('body').replaceWith(t.blockStatement([t.tryStatement(t.blockStatement([t.returnStatement(preceeding)]), null, (0, _replaceReturnStatements["default"])((0, _convertBodyToBlockStatement["default"])(handlerFunction), _builders.awaited).node)]));
  handlerFunction.get('body').scope.crawl();
  return (0, _replaceLink["default"])(link, handlerFunction.get('body'));
}