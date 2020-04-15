import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import restOfBlockStatement from './restOfBlockStatement'
import dump from './dump'

function isLastStatementInBlock<T extends t.Statement>(
  path: NodePath<T>
): boolean {
  const { parentPath } = path
  if (!parentPath.isBlockStatement()) return true
  const body = (parentPath as NodePath<t.BlockStatement>).get('body')
  return (path as NodePath<any>) === body[body.length - 1]
}

function isInBranch<T extends t.Statement>(
  path: NodePath<T>,
  branch: 'consequent' | 'alternate'
): boolean {
  const { parentPath } = path
  if (parentPath.isIfStatement())
    return (path as NodePath<any>) === parentPath.get(branch)
  if (parentPath.isBlockStatement()) {
    const grandparent = parentPath.parentPath
    return grandparent.isIfStatement() && parentPath === grandparent.get(branch)
  }
  return false
}

const isInConsequent = <T extends t.Statement>(path: NodePath<T>) =>
  isInBranch(path, 'consequent')
const isInAlternate = <T extends t.Statement>(path: NodePath<T>) =>
  isInBranch(path, 'alternate')

function convertToBlockStatement(
  blockOrExpression: NodePath<any>
): NodePath<t.BlockStatement> {
  if (blockOrExpression.isBlockStatement()) return blockOrExpression
  return (blockOrExpression.replaceWith(
    t.blockStatement(
      blockOrExpression.node == null
        ? []
        : [
            blockOrExpression.isStatement()
              ? blockOrExpression.node
              : t.expressionStatement(blockOrExpression.node),
          ]
    )
  ) as any)[0]
}

function addRestToConsequent<T extends t.Statement>(path: NodePath<T>): void {
  const ifStatement = path.findParent(p => p.isIfStatement())
  if (!ifStatement) throw new Error('failed to find parent IfStatement')
  const rest = restOfBlockStatement(ifStatement)
  if (!rest.length) return
  const consequent = (ifStatement as NodePath<t.IfStatement>).get('consequent')
  const restNodes = rest.map((path: NodePath<t.Statement>) => path.node)
  convertToBlockStatement(consequent).pushContainer('body', restNodes)
  rest.forEach((path: NodePath<t.Statement>) => path.remove())
}

function addRestToAlternate<T extends t.Statement>(path: NodePath<T>): void {
  const ifStatement = path.findParent(p => p.isIfStatement())
  if (!ifStatement) throw new Error('failed to find parent IfStatement')
  const rest = restOfBlockStatement(ifStatement)
  if (!rest.length) return
  let alternate: NodePath<any> = ifStatement
  while (alternate.isIfStatement()) {
    alternate = (alternate as NodePath<t.IfStatement>).get('alternate')
  }
  const restNodes = rest.map((path: NodePath<t.Statement>) => path.node)
  convertToBlockStatement(alternate).pushContainer('body', restNodes)
  rest.forEach((path: NodePath<t.Statement>) => path.remove())
}

export default function convertConditionalReturns(
  parent: NodePath<t.BlockStatement>
): boolean {
  let isUnwindable = true
  let ifDepth = 0
  const returnStatements: NodePath<t.ReturnStatement>[] = []
  parent.traverse(
    {
      IfStatement: {
        enter() {
          ifDepth++
        },
        exit() {
          ifDepth--
        },
      },
      ReturnStatement(path: NodePath<t.ReturnStatement>) {
        if (ifDepth > 1 || !isLastStatementInBlock(path)) {
          isUnwindable = false
          path.stop()
          return
        }
        let { parentPath } = path
        while (parentPath && parentPath !== parent) {
          if (
            parentPath.isLoop() ||
            parentPath.isSwitchCase() ||
            parentPath.isTryStatement()
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
  let returnStatement
  while ((returnStatement = returnStatements.pop())) {
    if (isInConsequent(returnStatement)) addRestToAlternate(returnStatement)
    else if (isInAlternate(returnStatement))
      addRestToConsequent(returnStatement)
  }
  return true
}
