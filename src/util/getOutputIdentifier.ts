import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import unboundIdentifier from './unboundIdentifier'

export default function getOutputIdentifier(
  link: NodePath<t.CallExpression>
): t.Identifier {
  const { parentPath } = link
  if (parentPath.isAwaitExpression()) {
    const grandparentPath = parentPath.parentPath
    if (grandparentPath.isVariableDeclarator()) {
      const id = (grandparentPath as NodePath<t.VariableDeclarator>).get('id')
      if (id.isIdentifier()) return id.node
    }
  }
  return unboundIdentifier(link)
}
