import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function recastBugWorkarounds(path: NodePath<any>): void {
  path.traverse({
    exit(path: NodePath<t.Node>) {
      const anyNode = path.node as any
      anyNode.comments = anyNode.leadingComments
    },
    AwaitExpression(path: NodePath<t.AwaitExpression>) {
      const argument = path.get('argument')
      const { parentPath } = path
      if (
        argument.isConditionalExpression() ||
        (parentPath.isMemberExpression() && path === parentPath.get('object'))
      ) {
        argument.replaceWith(t.parenthesizedExpression(argument.node))
      }
    },
  })
}
