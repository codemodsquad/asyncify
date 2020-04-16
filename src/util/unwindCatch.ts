import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import getPreceedingLink from './getPreceedingLink'
import { isNullish } from './predicates'
import replaceLink from './replaceLink'
import renameBoundIdentifiers from './renameBoundIdentifiers'
import unboundIdentifier from './unboundIdentifier'
import convertBodyToBlockStatement from './convertBodyToBlockStatement'
import mergeCatchIntoTryFinally from './mergeCatchIntoFinally'
import { awaited } from './builders'
import convertConditionalReturns from './convertConditionalReturns'

export default function unwindCatch(
  handler: NodePath<t.Expression>
): NodePath<any> | NodePath<any>[] {
  const link = handler.parentPath as NodePath<t.CallExpression>
  let preceeding
  if (link.node.arguments.length === 2) {
    preceeding = t.awaitExpression(
      t.callExpression(link.node.callee, [link.node.arguments[0]])
    )
  } else {
    preceeding = awaited(getPreceedingLink(link).node)
  }

  if (isNullish(handler.node)) {
    return replaceLink(link, preceeding)
  }

  if (!handler.isFunction()) {
    const callee = handler.node
    ;[handler] = handler.replaceWith(
      t.arrowFunctionExpression(
        [t.identifier('err')],
        t.callExpression(callee, [t.identifier('err')])
      )
    ) as any
  }
  const handlerFunction = handler as NodePath<t.Function>
  const body = handlerFunction.get('body')
  if (body.isBlockStatement() && !convertConditionalReturns(body)) {
    return getPreceedingLink(link)
  }

  const input = handlerFunction.get('params')[0]
  if (input) renameBoundIdentifiers(input, link.scope)
  const inputNode = input?.node
  if (input) input.remove()
  const catchClause = t.catchClause(
    inputNode || unboundIdentifier(handler, 'err'),
    convertBodyToBlockStatement(handlerFunction).node
  )

  body.replaceWith(
    t.blockStatement([
      t.tryStatement(
        t.blockStatement([t.returnStatement(preceeding)]),
        catchClause
      ),
    ])
  )
  const finalBody = handlerFunction.get('body') as NodePath<t.BlockStatement>
  ;(finalBody.scope as any).crawl()
  const tryStatement = finalBody.get('body')[0] as NodePath<t.TryStatement>
  const merged = mergeCatchIntoTryFinally(link, tryStatement)
  return merged || (replaceLink(link, finalBody) as any)
}
