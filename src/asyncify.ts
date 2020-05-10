import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import returnsOrAwaitsPromises from './util/returnsOrAwaitsPromises'
import { isPromiseMethodCall } from './util/predicates'
import findPromiseChains from './util/findPromiseChains'
import unwindPromiseChain from './util/unwindPromiseChain'
import finalCleanup from './util/finalCleanup'
import codeLength from './util/codeLength'
import babelBugWorkarounds from './util/babelBugWorkarounds'

function asyncifyFunction(path: NodePath<t.Function>): void {
  if (returnsOrAwaitsPromises(path)) {
    path.node.async = true
  }
  const chains = findPromiseChains(path)
  for (const chain of chains) {
    unwindPromiseChain(chain)
  }
  if (chains.length || path.node.async) {
    finalCleanup(path)
    babelBugWorkarounds(path)
  }
}

export default function asyncify(path: NodePath<any>): void {
  const functions: NodePath<t.Function>[] = []
  const { ignoreChainsShorterThan } = path.state
  path.traverse(
    {
      Function(path: NodePath<t.Function>): void {
        functions.push(path)
      },
      CallExpression(path: NodePath<t.CallExpression>) {
        if (isPromiseMethodCall(path.node)) {
          if (codeLength(path) < ignoreChainsShorterThan) {
            path.skip()
          }
        }
      },
    },
    path.state
  )
  let fn
  while ((fn = functions.pop())) asyncifyFunction(fn)
}
