import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function getPreceedingLink(
  link: NodePath<t.CallExpression>
): NodePath<t.Expression> {
  const callee = link.get('callee')
  if (!callee.isMemberExpression()) {
    throw new Error(`code that uses V8 intrinsic identifiers isn't supported`)
  }
  return callee.get('object') as NodePath<t.Expression>
}
