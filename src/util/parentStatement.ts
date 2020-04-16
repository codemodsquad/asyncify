import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function parentStatement<T extends t.Node>(
  path: NodePath<T>
): NodePath<t.Statement> {
  return path.find(
    p =>
      (p.isStatement() && p.parentPath && p.parentPath.isBlockStatement()) ||
      p.parentPath.isFunction()
  ) as NodePath<t.Statement>
}
