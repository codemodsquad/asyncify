import * as t from '@babel/types'
import { NodePaths, NodePath } from '@babel/traverse'

import parentStatement from './parentStatement'

export default function insertStatementsBefore<
  Statements extends t.Statement | t.Statement[]
>(path: NodePath<any>, statements: Statements): NodePaths<Statements> {
  let target = parentStatement(path)
  const { parentPath } = target
  if (
    (parentPath.isBlockParent() || parentPath.isIfStatement()) &&
    !parentPath.isBlockStatement()
  ) {
    const [newBlock] = target.replaceWith(
      t.blockStatement([
        target.isStatement()
          ? target.node
          : parentPath.isFunction()
          ? t.returnStatement((target as NodePath<t.Expression>).node)
          : t.expressionStatement((target as NodePath<t.Expression>).node),
      ])
    ) as any
    target = newBlock.get('body.0')
  }
  return target.insertBefore(statements)
}
