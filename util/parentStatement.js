"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = parentStatement;

function parentStatement(path) {
  return path.find(function (p) {
    return p.isStatement() && p.parentPath && p.parentPath.isBlockStatement() || p.parentPath.isFunction();
  });
}