import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import {
  isPromiseResolveCall,
  needsAwait,
  isPromiseRejectCall,
} from './predicates'

function unwrapPromiseResolves(node: t.Node | undefined): t.Node | undefined {
  while (node && isPromiseResolveCall(node)) {
    node = (node as t.CallExpression).arguments[0]
  }
  return node
}

export default function finalCleanup(path: NodePath<t.Function>): void {
  path.traverse({
    AwaitExpression(path: NodePath<t.AwaitExpression>) {
      const argument = path.get('argument')
      const { parentPath } = path
      if (argument.isCallExpression() && isPromiseResolveCall(argument)) {
        const value = unwrapPromiseResolves(argument.node)
        if (
          parentPath.isExpressionStatement() &&
          (!value || !needsAwait(value as any))
        ) {
          parentPath.remove()
        } else if (value) {
          argument.replaceWith(value)
        }
      }
    },
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      const argument = path.get('argument')
      const value = argument.isAwaitExpression()
        ? (argument as NodePath<t.AwaitExpression>).get('argument')
        : argument
      if (value.isCallExpression() && isPromiseResolveCall(value)) {
        const unwrapped = unwrapPromiseResolves(value.node)
        if (unwrapped) value.replaceWith(unwrapped)
        else argument.remove()
      } else if (value.isCallExpression() && isPromiseRejectCall(value)) {
        path.replaceWith(
          t.throwStatement(
            t.newExpression(
              t.identifier('Error'),
              value.node.arguments.slice(0, 1)
            )
          )
        )
      } else if (argument.isAwaitExpression()) {
        argument.replaceWith(argument.node.argument)
      }
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
}
