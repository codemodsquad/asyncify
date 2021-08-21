import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function isGetterOrSetter(
  path: NodePath<t.Function> | null
): boolean {
  return (
    path !== null &&
    (path.isObjectMethod() || path.isClassMethod()) &&
    (path.node.kind === 'get' || path.node.kind === 'set')
  )
}
