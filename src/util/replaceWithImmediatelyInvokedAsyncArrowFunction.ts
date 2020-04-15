import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import { awaited } from './builders'

export default function replaceWithImmediatelyInvokedAsyncArrowFunction<
  T extends t.Expression
>(path: NodePath<T>): [NodePath<t.CallExpression>, NodePath<T>] {
  let nodepath = 'callee.body.body.0.argument'
  const argument = awaited(path.node)
  if (argument !== path.node) nodepath += '.argument'
  const fn = t.arrowFunctionExpression(
    [],
    t.blockStatement([t.returnStatement(argument)])
  )
  fn.async = true
  const [replacement] = path.replaceWith(t.callExpression(fn, [])) as any
  return [replacement, replacement.get(nodepath)]
}
