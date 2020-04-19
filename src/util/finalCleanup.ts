import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import {
  isPromiseResolveCall,
  needsAwait,
  isPromiseRejectCall,
  isInTryBlock,
} from './predicates'
import { awaited } from './builders'

function unwrapPromiseResolves(
  node: t.Node | undefined
): t.Expression | undefined {
  while (node && isPromiseResolveCall(node)) {
    node = (node as t.CallExpression).arguments[0]
  }
  return node as t.Expression
}

function isEmptyBlock(path: NodePath<any>): boolean {
  return path.isBlockStatement() && path.node.body.length === 0
}

export default function finalCleanup(path: NodePath<t.Function>): void {
  path.traverse(
    {
      IfStatement: {
        exit(path: NodePath<t.IfStatement>) {
          const consequent = path.get('consequent')
          const alternate = path.get('alternate')
          if (isEmptyBlock(consequent)) {
            if (alternate.node == null) {
              path.remove()
            } else if (isEmptyBlock(alternate)) {
              path.remove()
            } else {
              path.replaceWith(
                t.ifStatement(
                  t.unaryExpression('!', path.node.test),
                  alternate.node
                )
              )
            }
          } else if (isEmptyBlock(alternate)) {
            path.node.alternate = null
            alternate.remove()
          }
        },
      },
      AwaitExpression(path: NodePath<t.AwaitExpression>) {
        const argument = path.get('argument')
        const { parentPath } = path
        if (argument.isCallExpression() && isPromiseResolveCall(argument)) {
          const value = unwrapPromiseResolves(argument.node)
          if (
            parentPath.isExpressionStatement() &&
            (!value || (!isInTryBlock(path) && !needsAwait(value as any)))
          ) {
            parentPath.remove()
          } else if (value) {
            argument.replaceWith(isInTryBlock(path) ? awaited(value) : value)
          }
        }
      },
      ReturnStatement(path: NodePath<t.ReturnStatement>) {
        const argument = path.get('argument')
        const value = argument.isAwaitExpression()
          ? (argument as NodePath<t.AwaitExpression>).get('argument')
          : argument
        if (value.isIdentifier() && value.node.name === 'undefined') {
          argument.remove()
        } else if (value.isCallExpression() && isPromiseResolveCall(value)) {
          const unwrapped = unwrapPromiseResolves(value.node)
          if (unwrapped) {
            value.replaceWith(
              isInTryBlock(path) && argument.isAwaitExpression()
                ? awaited(unwrapped)
                : unwrapped
            )
          } else argument.remove()
        } else if (value.isCallExpression() && isPromiseRejectCall(value)) {
          const argument = value.node.arguments[0]
          if (t.isExpression(argument)) {
            path.replaceWith(t.throwStatement(argument))
          }
        } else if (argument.isAwaitExpression() && !isInTryBlock(path)) {
          argument.replaceWith(argument.node.argument)
        }
      },
      Function(path: NodePath<t.Function>) {
        path.skip()
      },
    },
    path.state
  )
}
