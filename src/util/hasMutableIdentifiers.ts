import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function hasMutableIdentifiers<T extends t.PatternLike>(
  path: NodePath<T>
): boolean {
  let result = false
  path.traverse({
    Identifier(path: NodePath<t.Identifier>) {
      if (path.isBindingIdentifier()) {
        const binding = path.scope.getBinding(path.node.name)
        if (!binding) return
        if (!binding.constant) {
          path.stop()
          result = true
        }
      }
    },
  })
  return result
}
