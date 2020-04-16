"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = mergeCatchIntoTryFinally;

function mergeCatchIntoTryFinally(link, tryStatement) {
  var parent = link.parentPath;
  if (!parent.isAwaitExpression()) return null;
  parent = parent.parentPath;
  if (!parent.isStatement()) return null;
  var statement = parent;
  parent = parent.parentPath;
  if (!parent.isBlockStatement()) return null;
  var body = parent.node.body;
  if (body[body.length - 1] !== statement.node) return null;
  parent = parent.parentPath;
  if (!parent.isTryStatement() || parent.node.handler) return null;
  var _tryStatement$node = tryStatement.node,
      handler = _tryStatement$node.handler,
      block = _tryStatement$node.block;
  if (!handler || !block || block.type !== 'BlockStatement') return null;
  parent.get('handler').replaceWith(handler);
  return statement.replaceWithMultiple(block.body);
}