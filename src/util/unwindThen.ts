import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import getPreceedingLink from './getPreceedingLink'
import { awaited } from './builders'
import { isNullish } from './predicates'
import canUnwindAsIs from './canUnwindAsIs'
import renameBoundIdentifiers from './renameBoundIdentifiers'
import hasMutableIdentifiers from './hasMutableIdentifiers'
import prependBodyStatement from './prependBodyStatement'
import replaceLink from './replaceLink'
import convertConditionalReturns from './convertConditionalReturns'
import findNode from './findNode'
import canDefinitelyInvoke from './canDefinitelyInvoke'

export function unwindThen(
  handler: NodePath<t.Expression>
): NodePath<any> | null {
  const link = handler.parentPath as NodePath<t.CallExpression>
  const preceedingLink = getPreceedingLink(link)
  const preceeding = awaited(preceedingLink.node)

  if (isNullish(handler.node)) {
    return findNode(replaceLink(link, preceeding), preceedingLink.node)
  }

  if (handler.isFunction()) {
    handler.node.async = true
    const handlerFunction = handler as NodePath<t.Function>
    const input = handlerFunction.get('params')[0]
    const body = handlerFunction.get('body')
    if (
      body.isBlockStatement() &&
      !canUnwindAsIs(link) &&
      !convertConditionalReturns(body)
    ) {
      return preceedingLink
    }

    if (input) renameBoundIdentifiers(input, link.scope)
    const kind = input && hasMutableIdentifiers(input) ? 'let' : 'const'
    const inputNode = input?.node
    if (input) input.remove()
    const [prepended] = prependBodyStatement(
      handler,
      inputNode && !isNullish(inputNode)
        ? t.variableDeclaration(kind, [
            t.variableDeclarator(inputNode, preceeding),
          ])
        : t.expressionStatement(preceeding)
    )
    if (prepended.isVariableDeclaration()) {
      prepended.scope.registerBinding(
        prepended.node.kind,
        prepended.get('declarations.0.id') as any
      )
    }
    return findNode(
      replaceLink(link, handlerFunction.get('body')) as any,
      preceedingLink.node
    )
  }
  if (canDefinitelyInvoke(handler)) {
    return findNode(
      replaceLink(link, t.callExpression(handler.node, [preceeding])) as any,
      preceedingLink.node
    )
  }
  return preceedingLink
}
