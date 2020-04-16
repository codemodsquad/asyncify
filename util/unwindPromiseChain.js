"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = unwindPromiseChain;

var _findAwaitedExpression = _interopRequireDefault(require("./findAwaitedExpression"));

var _getThenHandler = _interopRequireDefault(require("./getThenHandler"));

var _getCatchHandler = _interopRequireDefault(require("./getCatchHandler"));

var _getFinallyHandler = _interopRequireDefault(require("./getFinallyHandler"));

var _unwindCatch = _interopRequireDefault(require("./unwindCatch"));

var _unwindThen = require("./unwindThen");

var _unwindFinally = _interopRequireDefault(require("./unwindFinally"));

var _parentStatement2 = _interopRequireDefault(require("./parentStatement"));

var _replaceWithImmediatelyInvokedAsyncArrowFunction = _interopRequireDefault(require("./replaceWithImmediatelyInvokedAsyncArrowFunction"));

function unwindPromiseChain(path) {
  if (!path.parentPath.isAwaitExpression()) {
    path = (0, _replaceWithImmediatelyInvokedAsyncArrowFunction["default"])(path)[1];
  }

  var _parentStatement = (0, _parentStatement2["default"])(path),
      scope = _parentStatement.scope;

  var link = path;

  while (link && link.isCallExpression()) {
    var callee = link.get('callee');
    if (!callee.isMemberExpression()) break;
    var thenHandler = (0, _getThenHandler["default"])(link);
    var catchHandler = (0, _getCatchHandler["default"])(link);
    var finallyHandler = (0, _getFinallyHandler["default"])(link);
    var replacements = null;

    if (catchHandler) {
      replacements = (0, _unwindCatch["default"])(catchHandler);
    } else if (thenHandler) {
      replacements = (0, _unwindThen.unwindThen)(thenHandler);
    } else if (finallyHandler) {
      replacements = (0, _unwindFinally["default"])(finallyHandler);
    }

    link = replacements ? (0, _findAwaitedExpression["default"])(replacements) : null;
    scope.crawl();
  }
}