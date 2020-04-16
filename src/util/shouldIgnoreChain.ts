import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import generate from '@babel/generator'

export default function shouldIgnoreChain(
  path: NodePath<t.CallExpression>
): boolean {
  const { ignoreChainsShorterThan } = path.state
  return (
    ignoreChainsShorterThan != null &&
    generate(path.node as any).code.length < ignoreChainsShorterThan
  )
}
