import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import generate from '@babel/generator'

export default function dump<T extends t.Node>(
  what: T | NodePath<T> | Array<T | NodePath<T>>
): void {
  if (Array.isArray(what)) {
    what.forEach(el => dump(el))
    if (!what.length) console.log('<empty array>')
    return
  }
  if (what instanceof NodePath) what = what.node
  console.log(generate(what as any).code)
}
