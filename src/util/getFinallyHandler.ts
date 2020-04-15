import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function getFinallyHandler(
  path: NodePath<t.CallExpression>
): NodePath<t.Expression> | null {
  const { callee } = path.node
  if (
    callee.type !== 'MemberExpression' ||
    callee.property.type !== 'Identifier' ||
    callee.property.name !== 'finally'
  ) {
    return null
  }
  const handler = path.get('arguments')[0]
  return handler && handler.isExpression() ? handler : null
}
