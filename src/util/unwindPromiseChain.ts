import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import findAwaitedExpression from './findAwaitedExpression'
import getThenHandler from './getThenHandler'
import getCatchHandler from './getCatchHandler'
import getFinallyHandler from './getFinallyHandler'
import unwindCatch from './unwindCatch'
import { unwindThen } from './unwindThen'
import unwindFinally from './unwindFinally'
import parentStatement from './parentStatement'

export default function unwindPromiseChain(
  path: NodePath<t.CallExpression>
): void {
  const { scope } = parentStatement(path)

  let link: NodePath<t.Expression> | null = path as any

  while (link && link.isCallExpression()) {
    const callee = (link as NodePath<t.CallExpression>).get('callee')
    if (!callee.isMemberExpression()) break

    const thenHandler = getThenHandler(link)
    const catchHandler = getCatchHandler(link)
    const finallyHandler = getFinallyHandler(link)

    let replacements: NodePath | NodePath[] | null = null
    if (catchHandler) {
      replacements = unwindCatch(catchHandler)
    } else if (thenHandler) {
      replacements = unwindThen(thenHandler)
    } else if (finallyHandler) {
      replacements = unwindFinally(finallyHandler)
    }
    link = replacements ? findAwaitedExpression(replacements) : null
    ;(scope as any).crawl()
  }
}
