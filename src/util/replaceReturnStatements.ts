import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import { isInSwitchCase, isInLoop } from './predicates'

export default function replaceReturnStatements<T extends t.Statement>(
  path: NodePath<t.BlockStatement>,
  getReplacement: (argument: t.Expression) => T | null | undefined
): NodePath<t.BlockStatement> {
  path.traverse(
    {
      ReturnStatement(path: NodePath<t.ReturnStatement>) {
        const replacement = getReplacement(
          path.node.argument || t.identifier('undefined')
        )
        if (!replacement) {
          if (isInLoop(path) || isInSwitchCase(path)) {
            path.replaceWith(t.breakStatement())
          } else {
            path.remove()
          }
        } else if (replacement.type === 'ReturnStatement') {
          const { argument } = replacement as t.ReturnStatement
          if (argument) path.get('argument').replaceWith(argument)
          else path.get('argument').remove()
        } else {
          if (isInLoop(path) || isInSwitchCase(path)) {
            path.replaceWithMultiple([replacement, t.breakStatement()])
          } else {
            path.replaceWith(replacement)
          }
        }
      },
      Function(path: NodePath<t.Function>) {
        path.skip()
      },
    },
    path.state
  )
  return path
}
