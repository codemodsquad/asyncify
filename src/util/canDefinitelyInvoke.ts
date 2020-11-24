import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function canDefinitelyInvoke<T extends t.Node>(
  expr: NodePath<T>
): boolean {
  if (expr.isIdentifier()) {
    let target: NodePath<any> | undefined = expr
    while (target) {
      if (target.isIdentifier()) {
        const nextTarget: NodePath<any> | undefined = target.scope.getBinding(
          target.node.name
        )?.path
        if (nextTarget === target) break
        target = nextTarget
      } else if (target.isVariableDeclarator()) {
        target = (target as NodePath<t.VariableDeclarator>).get('init')
      } else {
        break
      }
    }
    return target ? target.isFunction() : false
  }
  return expr.isFunction()
}
