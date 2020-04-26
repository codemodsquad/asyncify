import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import generate from '@babel/generator'
import iterateChain from './iterateChain'
import getThenHandler from './getThenHandler'
import getCatchHandler from './getCatchHandler'
import getFinallyHandler from './getFinallyHandler'

function chainLength(path: NodePath<t.CallExpression>): number {
  let length = 0
  for (const link of iterateChain(path)) length++
  return length
}

function isComplexHandler(path: NodePath<t.Expression> | null): boolean {
  if (!path || !path.isFunction()) return false
  const body = (path as NodePath<t.Function>).get('body')
  if (!body.isBlockStatement()) return false
  return (body as NodePath<t.BlockStatement>).node.body.length > 1
}

function hasComplexHandlers(path: NodePath<t.CallExpression>): boolean {
  for (const link of iterateChain(path)) {
    if (
      isComplexHandler(getThenHandler(path)) ||
      isComplexHandler(getCatchHandler(path)) ||
      isComplexHandler(getFinallyHandler(path))
    )
      return true
  }
  return false
}

export default function shouldIgnoreChain(
  path: NodePath<t.CallExpression>
): boolean {
  const { parentPath } = path
  if (
    !parentPath.isReturnStatement() &&
    !parentPath.isAwaitExpression() &&
    !parentPath.isFunction()
  ) {
    if (chainLength(path) <= 2 && !hasComplexHandlers(path)) return true
  }
  const { ignoreChainsShorterThan } = path.state
  return (
    ignoreChainsShorterThan != null &&
    generate(path.node as any).code.length < ignoreChainsShorterThan
  )
}
