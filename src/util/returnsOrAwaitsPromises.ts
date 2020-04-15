import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import { isPromiseValued } from './predicates'

export default function returnsOrAwaitsPromises(
  path: NodePath<t.Function>
): boolean {
  if (path.node.async) return true
  let result = false
  const body = path.get('body')
  if (!body.isBlockStatement()) {
    return isPromiseValued(body.node)
  }
  body.traverse({
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      const {
        node: { argument },
      } = path
      if (argument && isPromiseValued(argument)) {
        result = true
        path.stop()
      }
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
  return result
}
