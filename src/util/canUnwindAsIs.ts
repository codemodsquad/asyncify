import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function canUnwindAsIs(
  path: NodePath<t.CallExpression>
): boolean {
  let parent: NodePath<any> = path.parentPath
  let child: NodePath<any> = path
  while (parent && !parent.isFunction()) {
    if (parent.isBlockStatement()) {
      const body = (parent as NodePath<t.BlockStatement>).get('body')
      if (child !== body[body.length - 1]) return false
    } else if (parent.isLoop()) {
      return false
    } else if (parent.isSwitchCase()) {
      if ((parent.node as t.SwitchCase).test != null) return false
    } else if (!parent.isStatement() && !parent.isAwaitExpression()) {
      return false
    }
    child = parent
    parent = child.parentPath
  }
  return true
}
