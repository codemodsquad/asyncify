"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = codeLength;

var _traverse = require("@babel/traverse");

function codeLength(what) {
  if (what instanceof _traverse.NodePath) what = what.node;
  var _what = what,
      start = _what.start,
      end = _what.end;
  return start != null && end != null ? end - start : NaN;
}