import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'
import template from '@babel/template'

import {
  isIdentifierAssignmentExpression,
  isIdentifierDeclarator,
  isInTryBlock,
} from './predicates'
import renameBoundIdentifiers from './renameBoundIdentifiers'
import unboundIdentifier from './unboundIdentifier'
import replaceReturnStatements from './replaceReturnStatements'
import { awaited } from './builders'
import parentStatement from './parentStatement'
import insertStatementsBefore from './insertStatementsBefore'
import replaceWithStatements from './replaceWithStatements'

function findReplaceTarget<T extends t.Node>(link: NodePath<T>): NodePath<any> {
  const { parentPath } = link
  if (parentPath.isAwaitExpression()) return findReplaceTarget(parentPath)
  if (
    parentPath.isReturnStatement() ||
    parentPath.isExpressionStatement() ||
    isIdentifierAssignmentExpression(parentPath)
  ) {
    return parentPath
  }
  if (isIdentifierDeclarator(parentPath)) {
    const declaration = parentPath.parentPath
    if (
      declaration.isVariableDeclaration() &&
      declaration.node.declarations.length === 1
    ) {
      return declaration
    }
  }
  return link
}

function findOnlyFinalReturn(
  path: NodePath<t.BlockStatement>
): NodePath<t.ReturnStatement> | null {
  let count = 0
  path.traverse(
    {
      ReturnStatement(path: NodePath<t.ReturnStatement>) {
        if (count++) path.stop()
      },
      Function(path: NodePath<t.Function>) {
        path.skip()
      },
    },
    path.state
  )
  if (count !== 1) return null
  const body = path.get('body')
  const last = body[body.length - 1]
  return last.isReturnStatement() ? last : null
}

export default function replaceLink<T extends t.Expression | t.BlockStatement>(
  link: NodePath<t.CallExpression>,
  replacement: t.Expression | NodePath<T>
): NodePath<any> | NodePath<any>[] {
  if (!(replacement instanceof NodePath)) {
    const { parentPath } = link
    return (parentPath.isAwaitExpression() ? parentPath : link).replaceWith(
      awaited(replacement)
    ) as any
  }
  if (replacement.isBlockStatement()) {
    renameBoundIdentifiers(replacement, link.scope)
    const onlyFinalReturn = findOnlyFinalReturn(replacement)
    if (onlyFinalReturn) {
      const value = onlyFinalReturn.node.argument || t.identifier('undefined')
      onlyFinalReturn.remove()
      const { parentPath } = link
      const target = parentPath.isAwaitExpression() ? parentPath : link
      target.replaceWith(awaited(value))
      return insertStatementsBefore(target, replacement.node.body) as any
    }
    const target = findReplaceTarget(link)
    if (
      target.parentPath.isBlockParent() &&
      !target.parentPath.isBlockStatement()
    ) {
      // return replaceBlockParent(target, t.blockStatement(replacement.node.body))
      return replaceWithStatements(target, replacement.node.body) as any
    } else if (target.isReturnStatement()) {
      if (isInTryBlock(target)) {
        replaceReturnStatements(replacement, argument =>
          t.returnStatement(awaited(argument))
        )
      }
      return replaceWithStatements(target, replacement.node.body) as any
    } else if (target.isExpressionStatement()) {
      replaceReturnStatements(replacement, argument =>
        t.expressionStatement(awaited(argument))
      )
      return replaceWithStatements(target, replacement.node.body) as any
    } else if (target.isVariableDeclaration()) {
      const {
        declarations: [{ id }],
      } = target.node
      replacement.unshiftContainer('body', template.statements.ast`let ${id}`)
      replaceReturnStatements(replacement, argument =>
        t.expressionStatement(
          t.assignmentExpression('=', id, awaited(argument))
        )
      )
      return replaceWithStatements(target, replacement.node.body) as any
    } else if (target.isAssignmentExpression()) {
      const { left, operator } = target.node
      replaceReturnStatements(replacement, argument =>
        t.expressionStatement(
          t.assignmentExpression(operator, left, awaited(argument))
        )
      )
      return target.replaceWithMultiple(replacement.node.body) as any
    } else {
      const result = unboundIdentifier(replacement, 'result')
      replacement.unshiftContainer(
        'body',
        template.statements.ast`let ${result}`
      )
      replaceReturnStatements(replacement, argument =>
        t.expressionStatement(
          t.assignmentExpression('=', result, awaited(argument))
        )
      )
      target.replaceWith(result)
      const output = insertStatementsBefore(
        target,
        replacement.node.body
      ) as any
      return output
    }
  } else {
    const { parentPath } = link
    return (parentPath.isAwaitExpression() ? parentPath : link).replaceWith(
      awaited(replacement.node as t.Expression)
    ) as any
  }
}
