"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getCatchHandler;

function getCatchHandler(path) {
  var callee = path.node.callee;

  if (callee.type !== 'MemberExpression' || callee.property.type !== 'Identifier' || callee.property.name !== 'then' && callee.property.name !== 'catch') {
    return null;
  }

  var handler = path.get('arguments')[callee.property.name === 'then' ? 1 : 0];
  return handler && handler.isExpression() ? handler : null;
}