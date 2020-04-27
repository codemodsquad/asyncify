import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function hasReturnStatements(
  path: NodePath<t.BlockStatement>
): boolean {
  let found = false
  path.traverse({
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      found = true
      path.stop()
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
  return found
}
