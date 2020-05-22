import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import getPreceedingLink from './getPreceedingLink'
import { isNullish, isPromiseMethodCall } from './predicates'
import canUnwindAsIs from './canUnwindAsIs'
import replaceLink from './replaceLink'
import renameBoundIdentifiers from './renameBoundIdentifiers'
import unboundIdentifier from './unboundIdentifier'
import convertBodyToBlockStatement from './convertBodyToBlockStatement'
import mergeCatchIntoTryFinally from './mergeCatchIntoFinally'
import { awaited } from './builders'
import convertConditionalReturns from './convertConditionalReturns'
import findNode from './findNode'
import canDefinitelyInvoke from './canDefinitelyInvoke'

export default function unwindCatch(
  handler: NodePath<t.Expression>
): NodePath<any> | null {
  const link = handler.parentPath as NodePath<t.CallExpression>
  let preceedingLink
  let preceeding
  if (link.node.arguments.length === 2) {
    preceedingLink = t.callExpression(link.node.callee, [
      link.node.arguments[0],
    ])
    preceeding = t.awaitExpression(preceedingLink)
  } else {
    preceedingLink = getPreceedingLink(link).node
    preceeding = awaited(preceedingLink)
  }

  if (isNullish(handler.node)) {
    return findNode(replaceLink(link, preceeding), preceedingLink)
  }

  if (!handler.isFunction()) {
    if (!canDefinitelyInvoke(handler)) {
      return getPreceedingLink(link)
    }
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
  if (
    body.isBlockStatement() &&
    ((body.node.body.length === 0 &&
      !isPromiseMethodCall(getPreceedingLink(link).node)) ||
      (!canUnwindAsIs(link) && !convertConditionalReturns(body)))
  ) {
    return null
  }

  handlerFunction.node.async = true
  const input = handlerFunction.get('params')[0]
  if (input) renameBoundIdentifiers(input, link.scope)
  const inputNode = input?.node
  if (input) input.remove()
  if (
    inputNode?.type === 'AssignmentPattern' ||
    inputNode?.type === 'RestElement' ||
    inputNode?.type === 'TSParameterProperty'
  ) {
    throw new Error(
      'TODO: these catch parameter node types are not supported yet'
    )
  }
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
  return findNode(
    mergeCatchIntoTryFinally(link, tryStatement) ||
      (replaceLink(link, finalBody) as any),
    preceedingLink
  )
}
