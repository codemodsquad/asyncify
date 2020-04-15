import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function mergeCatchIntoTryFinally<T extends t.Node>(
  link: NodePath<T>,
  tryStatement: NodePath<t.TryStatement>
): NodePath | NodePath[] | null {
  let parent = link.parentPath
  if (!parent.isAwaitExpression()) return null
  parent = parent.parentPath
  if (!parent.isStatement()) return null
  const statement = parent
  parent = parent.parentPath
  if (!parent.isBlockStatement()) return null
  const body = (parent as NodePath<t.BlockStatement>).node.body
  if (body[body.length - 1] !== statement.node) return null
  parent = parent.parentPath
  if (!parent.isTryStatement() || parent.node.handler) return null
  const { handler, block } = tryStatement.node
  if (!handler || !block || block.type !== 'BlockStatement') return null
  ;(parent as NodePath<t.TryStatement>).get('handler').replaceWith(handler)
  return statement.replaceWithMultiple(block.body) as any
}
