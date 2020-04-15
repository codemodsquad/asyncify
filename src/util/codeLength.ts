import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function codeLength<T extends t.Node>(
  what: T | NodePath<T>
): number {
  if (what instanceof NodePath) what = what.node
  const { start, end } = what
  return start != null && end != null ? end - start : NaN
}
