import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function convertBodyToBlockStatement<T extends t.Function>(
  func: NodePath<T>
): NodePath<t.BlockStatement> {
  const body = func.get('body') as NodePath<t.Expression | t.BlockStatement>
  if (body.isBlockStatement()) return body
  return (body.replaceWith(
    t.blockStatement([t.returnStatement(body.node as t.Expression)])
  ) as any)[0]
}
