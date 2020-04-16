import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export function isNullish(node: t.Node): boolean {
  return (
    node.type === 'NullLiteral' ||
    (node.type === 'Identifier' && node.name === 'undefined')
  )
}

export function isPromiseMethodCall(node: t.Node): boolean {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.property.type === 'Identifier' &&
    (node.callee.property.name === 'then' ||
      node.callee.property.name === 'catch' ||
      node.callee.property.name === 'finally')
  )
}

export function isPromiseValued(node: t.Node): boolean {
  return (
    node.type === 'AwaitExpression' ||
    (node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.property.type === 'Identifier' &&
      ((node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'Promise') ||
        node.callee.property.name === 'then' ||
        node.callee.property.name === 'catch' ||
        node.callee.property.name === 'finally'))
  )
}

export function isPromiseHandler(path: NodePath<t.Function>): boolean {
  return isPromiseValued(path.parentPath.node)
}

function getPromiseStaticMethodCall<T extends t.Node>(
  thing: T | NodePath<T>
): string | null {
  if (thing instanceof NodePath) return getPromiseStaticMethodCall(thing.node)
  if (thing.type !== 'CallExpression') return null
  const { callee } = thing as t.CallExpression
  if (callee.type !== 'MemberExpression') return null
  const { object, property } = callee as t.MemberExpression
  if (
    object.type !== 'Identifier' ||
    object.name !== 'Promise' ||
    (property.type !== 'Identifier' && property.type !== 'StringLiteral')
  )
    return null
  return property.type === 'Identifier' ? property.name : property.value
}

export function isPromiseResolveCall<T extends t.Node>(
  thing: T | NodePath<T>
): boolean {
  return getPromiseStaticMethodCall(thing) === 'resolve'
}

export function isPromiseRejectCall<T extends t.Node>(
  thing: T | NodePath<T>
): boolean {
  return getPromiseStaticMethodCall(thing) === 'reject'
}

export function needsAwait<T extends t.Expression>(node: T): boolean {
  if (
    t.isLiteral(node) ||
    t.isArrayExpression(node) ||
    t.isObjectExpression(node) ||
    t.isFunctionExpression(node) ||
    t.isArrowFunctionExpression(node) ||
    t.isNewExpression(node) ||
    t.isBinaryExpression(node) ||
    t.isUnaryExpression(node) ||
    t.isThisExpression(node) ||
    t.isJSX(node) ||
    t.isAwaitExpression(node) ||
    isNullish(node)
  ) {
    return false
  } else {
    return true
  }
}

export function isIdentifierDeclarator<T extends t.Node>(
  path: NodePath<T>
): boolean {
  return (
    path.isVariableDeclarator() &&
    (path as NodePath<t.VariableDeclarator>).get('id').isIdentifier()
  )
}

export function isIdentifierAssignmentExpression<T extends t.Node>(
  path: NodePath<T>
): boolean {
  return (
    path.isAssignmentExpression() &&
    (path as NodePath<t.AssignmentExpression>).get('left').isIdentifier()
  )
}

export function isInSwitchCase(path: NodePath<any>): boolean {
  let { parentPath } = path
  while (parentPath && !parentPath.isFunction()) {
    if (parentPath.isSwitchCase()) return true
    ;({ parentPath } = parentPath)
  }
  return false
}

export function isInLoop(path: NodePath<any>): boolean {
  let { parentPath } = path
  while (parentPath && !parentPath.isFunction()) {
    if (parentPath.isLoop()) return true
    ;({ parentPath } = parentPath)
  }
  return false
}

export function isInTryBlock(path: NodePath<any>): boolean {
  let { parentPath } = path
  while (parentPath && !parentPath.isFunction()) {
    if (parentPath.isTryStatement() && parentPath.get('block') === path)
      return true
    path = parentPath
    ;({ parentPath } = path)
  }
  return false
}
