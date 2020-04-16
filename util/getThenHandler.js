"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getThenHandler;

function getThenHandler(path) {
  var callee = path.node.callee;

  if (callee.type !== 'MemberExpression' || callee.property.type !== 'Identifier' || callee.property.name !== 'then') {
    return null;
  }

  var handler = path.get('arguments')[0];
  return handler && handler.isExpression() ? handler : null;
}