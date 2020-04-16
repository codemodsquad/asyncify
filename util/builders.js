"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.awaited = awaited;

var t = _interopRequireWildcard(require("@babel/types"));

var _predicates = require("./predicates");

function awaited(node) {
  return (0, _predicates.needsAwait)(node) ? t.awaitExpression(node) : node;
}