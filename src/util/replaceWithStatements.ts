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
  if (!parentPath.isBlockStatement()) {
    return (path.replaceWith(t.blockStatement(statements)) as any)[0].get(
      'body'
    ) as NodePaths<Statements>
  }
  return path.replaceWithMultiple(statements) as NodePaths<Statements>
}
