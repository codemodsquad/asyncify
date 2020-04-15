import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import { needsAwait } from './predicates'

export function awaited<T extends t.Expression>(node: T): t.Expression {
  return needsAwait(node) ? t.awaitExpression(node) : node
}
