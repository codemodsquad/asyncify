import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function findNode<N extends t.Node>(
  path: NodePath<any> | NodePath<any>[],
  node: N
): NodePath<any> | null {
  if (Array.isArray(path)) {
    for (const p of path) {
      const result = findNode(p, node)
      if (result) return result
    }
    return null
  }

  let result: NodePath<any> | null = null

  path.traverse({
    [node.type](path: NodePath<any>) {
      if (path.node === node) {
        result = path
        path.stop()
      }
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })

  return result
}
