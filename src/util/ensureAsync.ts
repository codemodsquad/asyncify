import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import { awaited } from './builders'

export default function ensureAsync(path: NodePath<t.Function>): void {
  path.node.async = true
  path.get('body').traverse(
    {
      ReturnStatement(path: NodePath<t.ReturnStatement>) {
        const argument = path.get('argument')
        if (argument.node && !argument.isAwaitExpression()) {
          argument.replaceWith(
            awaited((argument as NodePath<t.Expression>).node)
          )
        }
      },
      Function(path: NodePath<t.Function>) {
        path.skip()
      },
    },
    path.state
  )
}
