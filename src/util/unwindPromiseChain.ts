import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import getThenHandler from './getThenHandler'
import getCatchHandler from './getCatchHandler'
import getFinallyHandler from './getFinallyHandler'
import unwindCatch from './unwindCatch'
import { unwindThen } from './unwindThen'
import unwindFinally from './unwindFinally'
import parentStatement from './parentStatement'
import replaceWithImmediatelyInvokedAsyncArrowFunction from './replaceWithImmediatelyInvokedAsyncArrowFunction'

export default function unwindPromiseChain(
  path: NodePath<t.CallExpression>
): void {
  if (
    !path.parentPath.isAwaitExpression() &&
    !path.parentPath.isReturnStatement() &&
    !path.parentPath.isFunction()
  ) {
    path = replaceWithImmediatelyInvokedAsyncArrowFunction(path)[1]
  }

  const { scope } = parentStatement(path)

  let link: NodePath<t.CallExpression> | null = path as any

  while (link) {
    const callee = link.get('callee')
    if (!callee.isMemberExpression()) break

    const thenHandler = getThenHandler(link)
    const catchHandler = getCatchHandler(link)
    const finallyHandler = getFinallyHandler(link)

    if (catchHandler) {
      link = unwindCatch(catchHandler)
    } else if (thenHandler) {
      link = unwindThen(thenHandler)
    } else if (finallyHandler) {
      link = unwindFinally(finallyHandler)
    } else {
      link = null
    }
    ;(scope as any).crawl()
  }
}
