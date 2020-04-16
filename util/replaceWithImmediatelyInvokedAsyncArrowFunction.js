"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = replaceWithImmediatelyInvokedAsyncArrowFunction;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var t = _interopRequireWildcard(require("@babel/types"));

var _builders = require("./builders");

function replaceWithImmediatelyInvokedAsyncArrowFunction(path) {
  var nodepath = 'callee.body.body.0.argument';
  var argument = (0, _builders.awaited)(path.node);
  if (argument !== path.node) nodepath += '.argument';
  var fn = t.arrowFunctionExpression([], t.blockStatement([t.returnStatement(argument)]));
  fn.async = true;

  var _ref = path.replaceWith(t.callExpression(fn, [])),
      _ref2 = (0, _slicedToArray2["default"])(_ref, 1),
      replacement = _ref2[0];

  return [replacement, replacement.get(nodepath)];
}