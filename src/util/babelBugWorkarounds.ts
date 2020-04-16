import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function babelBugWorkarounds(path: NodePath<any>): void {
  path.traverse({
    ObjectProperty(path: NodePath<t.ObjectProperty>) {
      const { node } = path
      if (
        node.shorthand &&
        node.key.type === 'Identifier' &&
        node.value.type === 'Identifier' &&
        node.key.name !== node.value.name
      ) {
        node.shorthand = false
      }
    },
  })
}
