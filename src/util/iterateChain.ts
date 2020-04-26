import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import { isPromiseMethodCall } from './predicates'

export default function* iterateChain(
  path: NodePath<t.CallExpression>
): Iterable<NodePath<t.CallExpression>> {
  while (isPromiseMethodCall(path.node)) {
    yield path
    const callee = path.get('callee')
    if (callee.isMemberExpression()) {
      const object = (callee as NodePath<t.MemberExpression>).get('object')
      if (object.isCallExpression()) path = object
      else break
    }
  }
}
