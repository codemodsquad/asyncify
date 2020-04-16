"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNullish = isNullish;
exports.isPromiseMethodCall = isPromiseMethodCall;
exports.isPromiseValued = isPromiseValued;
exports.isPromiseHandler = isPromiseHandler;
exports.isPromiseResolveCall = isPromiseResolveCall;
exports.isPromiseRejectCall = isPromiseRejectCall;
exports.needsAwait = needsAwait;
exports.isIdentifierDeclarator = isIdentifierDeclarator;
exports.isIdentifierAssignmentExpression = isIdentifierAssignmentExpression;
exports.isInSwitchCase = isInSwitchCase;
exports.isInLoop = isInLoop;
exports.isInTryBlock = isInTryBlock;

var t = _interopRequireWildcard(require("@babel/types"));

var _traverse = require("@babel/traverse");

function isNullish(node) {
  return node.type === 'NullLiteral' || node.type === 'Identifier' && node.name === 'undefined';
}

function isPromiseMethodCall(node) {
  return node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.property.type === 'Identifier' && (node.callee.property.name === 'then' || node.callee.property.name === 'catch' || node.callee.property.name === 'finally');
}

function isPromiseValued(node) {
  return node.type === 'AwaitExpression' || node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.property.type === 'Identifier' && (node.callee.object.type === 'Identifier' && node.callee.object.name === 'Promise' || node.callee.property.name === 'then' || node.callee.property.name === 'catch' || node.callee.property.name === 'finally');
}

function isPromiseHandler(path) {
  return isPromiseValued(path.parentPath.node);
}

function getPromiseStaticMethodCall(thing) {
  if (thing instanceof _traverse.NodePath) return getPromiseStaticMethodCall(thing.node);
  if (thing.type !== 'CallExpression') return null;
  var _ref = thing,
      callee = _ref.callee;
  if (callee.type !== 'MemberExpression') return null;
  var _ref2 = callee,
      object = _ref2.object,
      property = _ref2.property;
  if (object.type !== 'Identifier' || object.name !== 'Promise' || property.type !== 'Identifier' && property.type !== 'StringLiteral') return null;
  return property.type === 'Identifier' ? property.name : property.value;
}

function isPromiseResolveCall(thing) {
  return getPromiseStaticMethodCall(thing) === 'resolve';
}

function isPromiseRejectCall(thing) {
  return getPromiseStaticMethodCall(thing) === 'reject';
}

function needsAwait(node) {
  if (t.isLiteral(node) || t.isArrayExpression(node) || t.isObjectExpression(node) || t.isFunctionExpression(node) || t.isArrowFunctionExpression(node) || t.isNewExpression(node) || t.isBinaryExpression(node) || t.isUnaryExpression(node) || t.isThisExpression(node) || t.isJSX(node) || t.isAwaitExpression(node) || isNullish(node)) {
    return false;
  } else {
    return true;
  }
}

function isIdentifierDeclarator(path) {
  return path.isVariableDeclarator() && path.get('id').isIdentifier();
}

function isIdentifierAssignmentExpression(path) {
  return path.isAssignmentExpression() && path.get('left').isIdentifier();
}

function isInSwitchCase(path) {
  var parentPath = path.parentPath;

  while (parentPath && !parentPath.isFunction()) {
    if (parentPath.isSwitchCase()) return true;
    var _parentPath = parentPath;
    parentPath = _parentPath.parentPath;
  }

  return false;
}

function isInLoop(path) {
  var parentPath = path.parentPath;

  while (parentPath && !parentPath.isFunction()) {
    if (parentPath.isLoop()) return true;
    var _parentPath2 = parentPath;
    parentPath = _parentPath2.parentPath;
  }

  return false;
}

function isInTryBlock(path) {
  var _path = path,
      parentPath = _path.parentPath;

  while (parentPath && !parentPath.isFunction()) {
    if (parentPath.isTryStatement() && parentPath.get('block') === path) return true;
    path = parentPath;
    var _path2 = path;
    parentPath = _path2.parentPath;
  }

  return false;
}