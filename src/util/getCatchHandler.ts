import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function getCatchHandler(
  path: NodePath<t.CallExpression>
): NodePath<t.Expression> | null {
  const { callee } = path.node
  if (
    callee.type !== 'MemberExpression' ||
    callee.property.type !== 'Identifier' ||
    (callee.property.name !== 'then' && callee.property.name !== 'catch')
  ) {
    return null
  }
  const handler = path.get('arguments')[callee.property.name === 'then' ? 1 : 0]
  return handler && handler.isExpression() ? handler : null
}
