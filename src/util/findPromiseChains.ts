import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import { isPromiseMethodCall } from './predicates'

export default function findPromiseChains(
  path: NodePath<t.Function>
): NodePath<t.CallExpression>[] {
  const chains: NodePath<t.CallExpression>[] = []
  path.traverse({
    AwaitExpression(path: NodePath<t.AwaitExpression>) {
      const argument = path.get('argument')
      if (argument.isCallExpression() && isPromiseMethodCall(argument.node)) {
        chains.push(argument)
      }
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
  return chains
}
