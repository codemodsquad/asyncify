import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function recastBugWorkarounds(path: NodePath<any>): void {
  const visitedComments: Set<t.Comment> = new Set()
  path.traverse({
    exit(path: NodePath<t.Node>) {
      const { leadingComments } = path.node
      const anyNode = path.node as any
      if (leadingComments) {
        anyNode.comments = []
        if (leadingComments) {
          for (const comment of leadingComments) {
            if (visitedComments.has(comment)) continue
            visitedComments.add(comment)
            anyNode.comments.push({
              ...comment,
              leading: true,
              trailing: false,
            })
          }
        }
      } else {
        anyNode.comments = null
      }
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
  path.traverse({
    exit(path: NodePath<t.Node>) {
      const { trailingComments } = path.node
      const anyNode = path.node as any
      if (trailingComments) {
        if (!anyNode.comments) anyNode.comments = []
        for (const comment of trailingComments) {
          if (visitedComments.has(comment)) continue
          visitedComments.add(comment)
          anyNode.comments.push({
            ...comment,
            leading: false,
            trailing: true,
          })
        }
      }
    },
  })
}
