"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = dump;

var _traverse = require("@babel/traverse");

var _generator = _interopRequireDefault(require("@babel/generator"));

function dump(what) {
  if (Array.isArray(what)) {
    what.forEach(function (el) {
      return dump(el);
    });
    if (!what.length) console.log('<empty array>');
    return;
  }

  if (what instanceof _traverse.NodePath) what = what.node;
  console.log((0, _generator["default"])(what).code);
}