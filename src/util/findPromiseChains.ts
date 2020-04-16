import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import { isPromiseMethodCall } from './predicates'
import shouldIgnoreChain from './shouldIgnoreChain'

export default function findPromiseChains(
  path: NodePath<t.Function>
): NodePath<t.CallExpression>[] {
  const chains: NodePath<t.CallExpression>[] = []
  path.traverse(
    {
      CallExpression(path: NodePath<t.CallExpression>) {
        if (isPromiseMethodCall(path.node)) {
          if (!shouldIgnoreChain(path)) chains.push(path)
          path.skip()
        }
      },
      Function(path: NodePath<t.Function>) {
        path.skip()
      },
    },
    path.state
  )
  return chains
}
