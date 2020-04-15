import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import { awaited } from './builders'
import getPreceedingLink from './getPreceedingLink'
import { isNullish } from './predicates'
import replaceLink from './replaceLink'
import replaceReturnStatements from './replaceReturnStatements'
import convertBodyToBlockStatement from './convertBodyToBlockStatement'

export default function unwindFinally(
  handler: NodePath<t.Expression>
): NodePath | NodePath[] {
  const link = handler.parentPath as NodePath<t.CallExpression>
  const preceeding = awaited(getPreceedingLink(link).node)

  if (isNullish(handler.node)) {
    return replaceLink(link, preceeding)
  }

  if (!handler.isFunction()) {
    const callee = handler.node
    ;[handler] = handler.replaceWith(
      t.arrowFunctionExpression([], t.callExpression(callee, []))
    ) as any
  }
  const handlerFunction = handler as NodePath<t.Function>
  handlerFunction
    .get('body')
    .replaceWith(
      t.blockStatement([
        t.tryStatement(
          t.blockStatement([t.returnStatement(preceeding)]),
          null,
          replaceReturnStatements(
            convertBodyToBlockStatement(handlerFunction),
            awaited as any
          ).node
        ),
      ])
    )
  ;(handlerFunction.get('body').scope as any).crawl()
  return replaceLink(link, handlerFunction.get('body')) as any
}
