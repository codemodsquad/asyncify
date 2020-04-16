"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = convertBodyToBlockStatement;

var t = _interopRequireWildcard(require("@babel/types"));

function convertBodyToBlockStatement(func) {
  var body = func.get('body');
  if (body.isBlockStatement()) return body;
  return body.replaceWith(t.blockStatement([t.returnStatement(body.node)]))[0];
}