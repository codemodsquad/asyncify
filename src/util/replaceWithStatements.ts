import * as t from '@babel/types'
import { NodePaths, NodePath } from '@babel/traverse'

export default function replaceWithStatements<Statements extends t.Statement[]>(
  path: NodePath<any>,
  statements: Statements
): NodePaths<Statements> {
  const { parentPath } = path
  if (
    !parentPath.isBlockParent() &&
    !parentPath.isIfStatement() &&
    !parentPath.isSwitchCase()
  ) {
    throw new Error(
      'path must be a child of a BlockParent, SwitchCase, or IfStatement'
    )
  }
  const oldNode = path.node
  if (oldNode) {
    if (oldNode && statements[0]) {
      t.inheritLeadingComments(statements[0], oldNode)
    }
    if (oldNode && statements[statements.length - 1]) {
      t.inheritTrailingComments(statements[statements.length - 1], oldNode)
    }
    t.removeComments(oldNode)
  }
  if (!parentPath.isBlockStatement()) {
    return (path.replaceWith(t.blockStatement(statements)) as any)[0].get(
      'body'
    ) as NodePaths<Statements>
  }
  return path.replaceWithMultiple(statements) as NodePaths<Statements>
}
