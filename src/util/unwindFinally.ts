import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import { awaited } from './builders'
import getPreceedingLink from './getPreceedingLink'
import { isNullish } from './predicates'
import replaceLink from './replaceLink'
import replaceReturnStatements from './replaceReturnStatements'
import convertBodyToBlockStatement from './convertBodyToBlockStatement'
import convertConditionalReturns from './convertConditionalReturns'
import mergeStatementsIntoTryFinally from './mergeStatementsIntoTryFinally'
import findNode from './findNode'

export default function unwindFinally(
  handler: NodePath<t.Expression>
): NodePath<any> | null {
  const link = handler.parentPath as NodePath<t.CallExpression>
  const preceedingLink = getPreceedingLink(link)
  const preceeding = awaited(preceedingLink.node)

  if (isNullish(handler.node)) {
    return findNode(replaceLink(link, preceeding), preceedingLink.node)
  }

  if (!handler.isFunction()) {
    const callee = handler.node
    ;[handler] = handler.replaceWith(
      t.arrowFunctionExpression([], t.callExpression(callee, []))
    ) as any
  }
  const handlerFunction = handler as NodePath<t.Function>
  handlerFunction.node.async = true
  const body = handlerFunction.get('body')
  if (body.isBlockStatement() && !convertConditionalReturns(body)) {
    return preceedingLink
  }
  body.replaceWith(
    t.blockStatement([
      t.tryStatement(
        t.blockStatement([t.returnStatement(preceeding)]),
        null,
        replaceReturnStatements(
          convertBodyToBlockStatement(handlerFunction),
          (argument: t.Expression) =>
            isNullish(argument)
              ? null
              : t.expressionStatement(awaited(argument))
        ).node
      ),
    ])
  )
  const finalBody = handlerFunction.get('body')
  ;(finalBody.scope as any).crawl()
  const tryStatement = finalBody.get('body.0') as NodePath<t.TryStatement>
  return findNode(
    mergeStatementsIntoTryFinally(link, tryStatement) ||
      (replaceLink(link, finalBody) as any),
    preceedingLink.node
  )
}
