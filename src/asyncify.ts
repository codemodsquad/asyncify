import { NodePath, NodePaths, Scope } from '@babel/traverse'
import template from '@babel/template'
import generate from '@babel/generator'
import * as t from '@babel/types'

const dump = (path: NodePath<any>) => console.log(generate(path.node).code)

function isNullish(node: t.Node): boolean {
  return (
    node.type === 'NullLiteral' ||
    (node.type === 'Identifier' && node.name === 'undefined')
  )
}

export function isPromiseMethodCall(node: t.Node): boolean {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.property.type === 'Identifier' &&
    (node.callee.property.name === 'then' ||
      node.callee.property.name === 'catch' ||
      node.callee.property.name === 'finally')
  )
}

export function isPromiseValued(node: t.Node): boolean {
  return (
    node.type === 'AwaitExpression' ||
    (node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.property.type === 'Identifier' &&
      ((node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'Promise') ||
        node.callee.property.name === 'then' ||
        node.callee.property.name === 'catch' ||
        node.callee.property.name === 'finally'))
  )
}

export function returnsOrAwaitsPromises(path: NodePath<t.Function>): boolean {
  if (path.node.async) return true
  let result = false
  const body = path.get('body')
  if (!body.isBlockStatement()) {
    return isPromiseValued(body.node)
  }
  body.traverse({
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      const {
        node: { argument },
      } = path
      if (argument && isPromiseValued(argument)) {
        result = true
        path.stop()
      }
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
  return result
}

export function isPromiseHandler(path: NodePath<t.Function>): boolean {
  return isPromiseValued(path.parentPath.node)
}

export function awaitedIfNecessary<T extends t.Expression>(
  node: T
): t.Expression {
  if (
    t.isLiteral(node) ||
    t.isArrayExpression(node) ||
    t.isObjectExpression(node) ||
    t.isFunctionExpression(node) ||
    t.isArrowFunctionExpression(node) ||
    t.isNewExpression(node) ||
    t.isBinaryExpression(node) ||
    t.isUnaryExpression(node) ||
    t.isThisExpression(node) ||
    t.isJSX(node) ||
    t.isAwaitExpression(node) ||
    isNullish(node)
  ) {
    return node
  } else {
    return t.awaitExpression(node)
  }
}

export function getThenHandler(
  path: NodePath<t.CallExpression>
): NodePath<t.Expression> | null {
  const { callee } = path.node
  if (
    callee.type !== 'MemberExpression' ||
    callee.property.type !== 'Identifier' ||
    callee.property.name !== 'then'
  ) {
    return null
  }
  const handler = path.get('arguments')[0]
  return handler && handler.isExpression() ? handler : null
}

export function getCatchHandler(
  path: NodePath<t.CallExpression>
): NodePath<t.Expression> | null {
  const { callee } = path.node
  if (
    callee.type !== 'MemberExpression' ||
    callee.property.type !== 'Identifier' ||
    (callee.property.name !== 'then' && callee.property.name !== 'catch')
  ) {
    return null
  }
  const handler = path.get('arguments')[callee.property.name === 'then' ? 1 : 0]
  return handler && handler.isExpression() ? handler : null
}

export function getFinallyHandler(
  path: NodePath<t.CallExpression>
): NodePath<t.Expression> | null {
  const { callee } = path.node
  if (
    callee.type !== 'MemberExpression' ||
    callee.property.type !== 'Identifier' ||
    callee.property.name !== 'finally'
  ) {
    return null
  }
  const handler = path.get('arguments')[0]
  return handler && handler.isExpression() ? handler : null
}

function unboundIdentifier<T>(
  path: NodePath<T>,
  prefix?: string
): t.Identifier {
  let counter = 0
  let name = prefix || `_ASYNCIFY_${counter++}`
  while (path.scope.hasBinding(name))
    name = `${prefix || '_ASYNCIFY_'}${counter++}`
  return t.identifier(name)
}

function parentStatement<T extends t.Node>(
  path: NodePath<T>
): NodePath<t.Statement> {
  const parent = path.findParent((p: NodePath<t.Node>) => p.isStatement())
  if (!parent) throw new Error('failed to find parent statement')
  return parent as NodePath<t.Statement>
}

function renameBoundIdentifiers<T extends t.Node>(
  parent: NodePath<T>,
  destScope: Scope
): void {
  function isBound(name: string): boolean {
    return destScope.hasBinding(name)
  }

  function rename(path: NodePath<t.Identifier>): void {
    let newName = path.node.name
    let counter = 0
    while (isBound(newName)) newName = `${path.node.name}${counter++}`
    path.scope.rename(path.node.name, newName)
  }

  function mustRename(path: NodePath<t.Identifier>): boolean {
    const { name } = path.node
    return (
      isBound(name) &&
      path.isBindingIdentifier() &&
      ((destScope.hasBinding(name) &&
        parent.scope.getBindingIdentifier(name) === path.node) ||
        path.scope.getBinding(name)?.kind === 'var')
    )
  }

  if (parent.isIdentifier() && mustRename(parent)) rename(parent)

  parent.traverse({
    Identifier: (path: NodePath<t.Identifier>) => {
      if (mustRename(path)) rename(path)
    },
    Function(path: NodePath<t.Function>) {
      path.skipKey('body')
    },
  })
}

export function getOutputIdentifier(
  link: NodePath<t.CallExpression>
): t.Identifier {
  const { parentPath } = link
  if (parentPath.isAwaitExpression()) {
    const grandparentPath = parentPath.parentPath
    if (grandparentPath.isVariableDeclarator()) {
      const id = (grandparentPath as NodePath<t.VariableDeclarator>).get('id')
      if (id.isIdentifier()) return id.node
    }
  }
  return unboundIdentifier(link)
}

export function prepareHandler(handler: NodePath<t.Function>): void {
  // TODO eliminate fallthrough
}

function convertBodyToBlockStatement<T extends t.Function>(
  func: NodePath<T>
): NodePath<t.BlockStatement> {
  const body = func.get('body') as NodePath<t.Expression | t.BlockStatement>
  if (body.isBlockStatement()) return body
  return (body.replaceWith(
    t.blockStatement([t.returnStatement(body.node as t.Expression)])
  ) as any)[0]
}

function prependBodyStatement<T extends t.Function, S extends t.Statement>(
  func: NodePath<T>,
  statement: S
): NodePaths<S[]> {
  return convertBodyToBlockStatement(func).unshiftContainer('body', [statement])
}

function replaceReturnStatements<T extends t.Statement>(
  path: NodePath<t.BlockStatement>,
  getReplacement: (statement: t.Expression) => T
): NodePath<t.BlockStatement> {
  path.traverse({
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      const replacement = getReplacement(
        path.node.argument || t.identifier('undefined')
      )
      if (replacement.type === 'ReturnStatement') {
        const { argument } = replacement as t.ReturnStatement
        if (argument) path.get('argument').replaceWith(argument)
        else path.get('argument').remove()
      } else path.replaceWith(replacement)
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
  return path
}

function isIdentifierDeclarator<T extends t.Node>(path: NodePath<T>): boolean {
  return (
    path.isVariableDeclarator() &&
    (path as NodePath<t.VariableDeclarator>).get('id').isIdentifier()
  )
}

function isIdentifierAssignmentExpression<T extends t.Node>(
  path: NodePath<T>
): boolean {
  return (
    path.isAssignmentExpression() &&
    (path as NodePath<t.AssignmentExpression>).get('left').isIdentifier()
  )
}

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
  path.traverse({
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      if (count++) path.stop()
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
  if (count !== 1) return null
  const body = path.get('body')
  const last = body[body.length - 1]
  return last.isReturnStatement() ? last : null
}

function replaceLink<T extends t.Expression | t.BlockStatement>(
  link: NodePath<t.CallExpression>,
  replacement: t.Expression | NodePath<T>
): NodePath | NodePath[] {
  if (!(replacement instanceof NodePath)) {
    const { parentPath } = link
    return (parentPath.isAwaitExpression() ? parentPath : link).replaceWith(
      awaitedIfNecessary(replacement)
    ) as any
  }
  if (replacement.isBlockStatement()) {
    renameBoundIdentifiers(replacement, link.scope)
    const onlyFinalReturn = findOnlyFinalReturn(replacement)
    if (onlyFinalReturn) {
      const value = onlyFinalReturn.node.argument || t.identifier('undefined')
      onlyFinalReturn.remove()
      const output = parentStatement(link).insertBefore(
        replacement.node.body
      ) as any
      const { parentPath } = link
      let target = parentPath.isAwaitExpression() ? parentPath : link
      target.replaceWith(awaitedIfNecessary(value))
      return output
    }
    const target = findReplaceTarget(link)
    if (target.isReturnStatement()) {
      replaceReturnStatements(replacement, argument =>
        t.returnStatement(awaitedIfNecessary(argument))
      )
      return target.replaceWithMultiple(replacement.node.body) as any
    } else if (target.isExpressionStatement()) {
      replaceReturnStatements(replacement, argument =>
        t.expressionStatement(awaitedIfNecessary(argument))
      )
      return target.replaceWithMultiple(replacement.node.body) as any
    } else if (target.isVariableDeclaration()) {
      const {
        declarations: [{ id }],
      } = target.node
      replacement.unshiftContainer('body', template.statements.ast`let ${id}`)
      replaceReturnStatements(replacement, argument =>
        t.expressionStatement(
          t.assignmentExpression('=', id, awaitedIfNecessary(argument))
        )
      )
      return target.replaceWithMultiple(replacement.node.body) as any
    } else if (target.isAssignmentExpression()) {
      const { left, operator } = target.node
      replaceReturnStatements(replacement, argument =>
        t.expressionStatement(
          t.assignmentExpression(operator, left, awaitedIfNecessary(argument))
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
          t.assignmentExpression('=', result, awaitedIfNecessary(argument))
        )
      )
      const output = parentStatement(target).insertBefore(
        replacement.node.body
      ) as any
      target.replaceWith(result)
      return output
    }
  } else {
    const { parentPath } = link
    return (parentPath.isAwaitExpression() ? parentPath : link).replaceWith(
      awaitedIfNecessary(replacement.node as t.Expression)
    ) as any
  }
}

function getPreceedingLink(
  link: NodePath<t.CallExpression>
): NodePath<t.Expression> {
  const callee = link.get('callee')
  if (!callee.isMemberExpression()) {
    throw new Error(`code that uses V8 intrinsic identifiers isn't supported`)
  }
  return callee.get('object') as NodePath<t.Expression>
}

function hasMutableIdentifiers<T extends t.Node>(path: NodePath<T>): boolean {
  let result = false
  path.traverse({
    Identifier(path: NodePath<t.Identifier>) {
      if (path.isBindingIdentifier()) {
        const binding = path.scope.getBinding(path.node.name)
        if (!binding) return
        if (!binding.constant) {
          path.stop()
          result = true
        }
      }
    },
  })
  return result
}

export function unwindThen(
  handler: NodePath<t.Expression>
): NodePath | NodePath[] {
  const link = handler.parentPath as NodePath<t.CallExpression>
  const preceeding = awaitedIfNecessary(getPreceedingLink(link).node)

  if (isNullish(handler.node)) {
    return replaceLink(link, preceeding)
  }

  if (handler.isFunction()) {
    const handlerFunction = handler as NodePath<t.Function>
    const input = handlerFunction.get('params')[0]
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
    return replaceLink(link, handlerFunction.get('body')) as any
  }
  return replaceLink(link, t.callExpression(handler.node, [preceeding])) as any
}

function mergeCatchIntoTryFinally<T extends t.Node>(
  link: NodePath<T>,
  tryStatement: NodePath<t.TryStatement>
): NodePath | NodePath[] | null {
  let parent = link.parentPath
  if (!parent.isAwaitExpression()) return null
  parent = parent.parentPath
  if (!parent.isStatement()) return null
  const statement = parent
  parent = parent.parentPath
  if (!parent.isBlockStatement()) return null
  const body = (parent as NodePath<t.BlockStatement>).node.body
  if (body[body.length - 1] !== statement.node) return null
  parent = parent.parentPath
  if (!parent.isTryStatement() || parent.node.handler) return null
  const { handler, block } = tryStatement.node
  if (!handler || !block || block.type !== 'BlockStatement') return null
  ;(parent as NodePath<t.TryStatement>).get('handler').replaceWith(handler)
  return statement.replaceWithMultiple(block.body) as any
}

export function unwindCatch(
  handler: NodePath<t.Expression>
): NodePath | NodePath[] {
  const link = handler.parentPath as NodePath<t.CallExpression>
  let preceeding
  if (link.node.arguments.length === 2) {
    preceeding = t.awaitExpression(
      t.callExpression(link.node.callee, [link.node.arguments[0]])
    )
  } else {
    preceeding = awaitedIfNecessary(getPreceedingLink(link).node)
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
  const input = handlerFunction.get('params')[0]
  if (input) renameBoundIdentifiers(input, link.scope)
  const inputNode = input?.node
  if (input) input.remove()
  const catchClause = t.catchClause(
    inputNode || unboundIdentifier(handler, 'err'),
    convertBodyToBlockStatement(handlerFunction).node
  )

  handlerFunction
    .get('body')
    .replaceWith(
      t.blockStatement([
        t.tryStatement(
          t.blockStatement([t.returnStatement(preceeding)]),
          catchClause
        ),
      ])
    )
  const body = handlerFunction.get('body') as NodePath<t.BlockStatement>
  ;(body.scope as any).crawl()
  const tryStatement = body.get('body')[0] as NodePath<t.TryStatement>
  const merged = mergeCatchIntoTryFinally(link, tryStatement)
  return merged || (replaceLink(link, body) as any)
}

export function unwindFinally(
  handler: NodePath<t.Expression>
): NodePath | NodePath[] {
  const link = handler.parentPath as NodePath<t.CallExpression>
  const preceeding = awaitedIfNecessary(getPreceedingLink(link).node)

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
            awaitedIfNecessary as any
          ).node
        ),
      ])
    )
  ;(handlerFunction.get('body').scope as any).crawl()
  return replaceLink(link, handlerFunction.get('body')) as any
}

function findAwaitedExpression(
  paths: NodePath | NodePath[]
): NodePath<t.Expression> | null {
  if (Array.isArray(paths)) {
    for (const path of paths) {
      const result = findAwaitedExpression(path)
      if (result) return result
    }
    return null
  }
  let result: NodePath<t.Expression> | null = null
  paths.traverse({
    AwaitExpression(path: NodePath<t.AwaitExpression>) {
      if (result == null) result = path.get('argument')
      path.stop()
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
  return result
}

export function unwindPromiseChain(path: NodePath<t.CallExpression>): void {
  const { scope } = parentStatement(path)

  let link: NodePath<t.Expression> | null = path as any

  while (link && link.isCallExpression()) {
    const thenHandler = getThenHandler(link)
    const catchHandler = getCatchHandler(link)
    const finallyHandler = getFinallyHandler(link)

    const callee = (link as NodePath<t.CallExpression>).get('callee')
    if (!callee.isMemberExpression()) break

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

export function unwindPromiseChains(path: NodePath<t.Function>): void {
  const chains: NodePath<t.CallExpression>[] = []
  path.traverse({
    AwaitExpression(path: NodePath<t.AwaitExpression>) {
      const argument = path.get('argument')
      if (argument.isCallExpression() && isPromiseMethodCall(argument.node)) {
        chains.push(argument)
      }
    },
    // ReturnStatement(path: NodePath<t.ReturnStatement>) {
    //   const { argument } = path.node
    //   if (argument && argument.type !== 'AwaitExpression') {
    //     path.get('argument').replaceWith(awaitedIfNecessary(argument))
    //   }
    // },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
  for (const chain of chains) unwindPromiseChain(chain)
}

export function ensureAsync(path: NodePath<t.Function>): void {
  path.node.async = true
  path.get('body').traverse({
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      const argument = path.get('argument')
      if (argument && !argument.isAwaitExpression()) {
        argument.replaceWith(
          awaitedIfNecessary((argument as NodePath<t.Expression>).node)
        )
      }
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
}

function asyncifyFunction(path: NodePath<t.Function>): void {
  if (!returnsOrAwaitsPromises(path) && !isPromiseHandler(path)) return
  ensureAsync(path)
  unwindPromiseChains(path)
}

export default function asyncify(path: NodePath<any>): void {
  const functions: NodePath<t.Function>[] = []
  path.traverse({
    Function(path: NodePath<t.Function>): void {
      functions.push(path)
    },
  })
  let fn
  while ((fn = functions.pop())) asyncifyFunction(fn)
}
