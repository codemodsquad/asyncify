import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function replaceReturnStatements<T extends t.Statement>(
  path: NodePath<t.BlockStatement>,
  getReplacement: (statement: t.Expression) => T
): NodePath<t.BlockStatement> {
  path.traverse({
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      const replacement = getReplacement(
        path.node.argument || t.identifier('undefined')
      )
      if (replacement.type === 'ReturnStatement') {
        const { argument } = replacement as t.ReturnStatement
        if (argument) path.get('argument').replaceWith(argument)
        else path.get('argument').remove()
      } else path.replaceWith(replacement)
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
  return path
}
