import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import returnsOrAwaitsPromises from './util/returnsOrAwaitsPromises'
import { isPromiseHandler } from './util/predicates'
import ensureAsync from './util/ensureAsync'
import findPromiseChains from './util/findPromiseChains'
import unwindPromiseChain from './util/unwindPromiseChain'
import finalCleanup from './util/finalCleanup'

function asyncifyFunction(path: NodePath<t.Function>): void {
  if (!returnsOrAwaitsPromises(path) && !isPromiseHandler(path)) return
  ensureAsync(path)
  for (const chain of findPromiseChains(path)) {
    unwindPromiseChain(chain)
  }
  finalCleanup(path)
}

export default function asyncify(path: NodePath<any>): void {
  const functions: NodePath<t.Function>[] = []
  path.traverse({
    Function(path: NodePath<t.Function>): void {
      functions.push(path)
    },
  })
  let fn
  while ((fn = functions.pop())) asyncifyFunction(fn)
}
