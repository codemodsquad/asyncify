import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import replaceWithStatements from './replaceWithStatements'
import removeRestOfBlockStatement from './removeRestOfBlockStatement'
import { isLastStatementInBlock } from './predicates'

function hasReturn(path: NodePath<t.Statement>): boolean {
  if (path.isReturnStatement()) return true
  if (path.isBlockStatement()) {
    for (const child of (path as NodePath<t.BlockStatement>).get('body')) {
      if (child.isReturnStatement()) return true
    }
  }
  return false
}

function splitBranches(
  path: NodePath<t.IfStatement>
): {
  returning: NodePath<t.Statement>[]
  notReturning: (NodePath<t.Statement> | NodePath<null>)[]
} {
  const returning: NodePath<t.Statement>[] = []
  const notReturning: (NodePath<t.Statement> | NodePath<null>)[] = []
  let p: NodePath<t.IfStatement> | NodePath<null> = path
  while (p.isIfStatement()) {
    const consequent = (p as NodePath<t.IfStatement>).get('consequent')
    const alternate: NodePath<any> = (p as NodePath<t.IfStatement>).get(
      'alternate'
    )
    ;(hasReturn(consequent) ? returning : notReturning).push(consequent)
    if (!alternate.isIfStatement()) {
      ;(hasReturn(alternate) ? returning : notReturning).push(alternate)
    }

    p = alternate
  }
  return { returning, notReturning }
}

export default function convertConditionalReturns(
  parent: NodePath<t.BlockStatement>
): boolean {
  let ifDepth = 0
  let isUnwindable = true
  const ifStatements: NodePath<t.IfStatement>[] = []
  const returnStatements: NodePath<t.ReturnStatement>[] = []
  parent.traverse(
    {
      IfStatement: {
        enter(path: NodePath<t.IfStatement>) {
          if (path.parentPath.isIfStatement()) return
          ifDepth++
          const { returning, notReturning } = splitBranches(path)
          if (returning.length > 0) {
            if (notReturning.length === 1) {
              ifStatements.push(path)
            } else if (notReturning.length > 1) {
              isUnwindable = false
              path.stop()
              return
            }
          }
        },
        exit(path: NodePath<t.IfStatement>) {
          if (path.parentPath.isIfStatement()) return
          ifDepth--
        },
      },
      ReturnStatement(path: NodePath<t.ReturnStatement>) {
        let { parentPath } = path
        let loopDepth = 0
        while (parentPath && parentPath !== parent) {
          if (parentPath.isLoop()) loopDepth++
          if (
            loopDepth > 1 ||
            (!isLastStatementInBlock(parentPath) &&
              (!parentPath.isIfStatement() || ifDepth > 1))
          ) {
            isUnwindable = false
            path.stop()
            return
          }
          ;({ parentPath } = parentPath)
        }
        returnStatements.push(path)
      },
      Function(path: NodePath<t.Function>) {
        path.skip()
      },
    },
    parent.state
  )
  if (!isUnwindable) return false
  let ifStatement
  while ((ifStatement = ifStatements.pop())) {
    const {
      notReturning: [branch],
    } = splitBranches(ifStatement)
    const rest = removeRestOfBlockStatement(ifStatement)
    if (branch.isBlockStatement())
      (branch as NodePath<t.BlockStatement>).pushContainer('body', rest)
    else replaceWithStatements(branch, rest)
  }
  return true
}
