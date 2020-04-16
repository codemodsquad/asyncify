"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getFinallyHandler;

function getFinallyHandler(path) {
  var callee = path.node.callee;

  if (callee.type !== 'MemberExpression' || callee.property.type !== 'Identifier' || callee.property.name !== 'finally') {
    return null;
  }

  var handler = path.get('arguments')[0];
  return handler && handler.isExpression() ? handler : null;
}