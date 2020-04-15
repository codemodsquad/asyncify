import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function unboundIdentifier<T>(
  path: NodePath<T>,
  prefix?: string
): t.Identifier {
  let counter = 0
  let name = prefix || `_ASYNCIFY_${counter++}`
  while (path.scope.hasBinding(name))
    name = `${prefix || '_ASYNCIFY_'}${counter++}`
  return t.identifier(name)
}
