import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import { isPromiseMethodCall } from './predicates'

export default function findNextLinkToUnwind(
  paths: NodePath | NodePath[],
  except?: t.CallExpression
): NodePath<t.CallExpression> | null {
  if (Array.isArray(paths)) {
    for (const path of paths) {
      const result = findNextLinkToUnwind(path, except)
      if (result) return result
    }
    return null
  }
  const path = paths
  if (path.node !== except && isPromiseMethodCall(path.node))
    return path as NodePath<t.CallExpression>
  let result: NodePath<t.CallExpression> | null = null
  path.traverse(
    {
      CallExpression(path: NodePath<t.CallExpression>) {
        if (path.node !== except && isPromiseMethodCall(path.node)) {
          if (result == null) result = path
          path.stop()
        }
      },
      Function(path: NodePath<t.Function>) {
        path.skip()
      },
    },
    path.state
  )
  return result
}
