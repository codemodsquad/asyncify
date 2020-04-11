import { NodePath } from '@babel/traverse'
import template from '@babel/template'
import generate from '@babel/generator'
import * as t from '@babel/types'

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
  return handler && handler.isExpression() && !isNullish(handler.node)
    ? handler
    : null
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
  return handler && handler.isExpression() && !isNullish(handler.node)
    ? handler
    : null
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
  return handler && handler.isExpression() && !isNullish(handler.node)
    ? handler
    : null
}

export function preceedingPromiseMethodCall(
  path: NodePath<t.CallExpression>
): NodePath<t.CallExpression> | null {
  const callee = path.get('callee')
  if (callee.isMemberExpression()) {
    const object = (callee as NodePath<t.MemberExpression>).get('object')
    if (isPromiseMethodCall(object.node)) {
      return object as NodePath<t.CallExpression>
    }
  }
  return null
}

export function getFinalReturn(
  path: NodePath<t.BlockStatement>
): NodePath<t.ReturnStatement> | null {
  const body = path.get('body')
  const lastStatement = body[body.length - 1]
  return lastStatement && lastStatement.isReturnStatement()
    ? lastStatement
    : null
}

export function needsConversionToSingleReturn(
  path: NodePath<t.BlockStatement>
): boolean | null {
  let bail = false
  const branchReturnsStack: Array<boolean> = []
  let returningBranchFound = false
  let notReturningBranchFound = false
  let inLoop = 0
  const loopHandler = {
    enter(): void {
      inLoop++
    },
    exit(): void {
      inLoop--
    },
  }
  path.traverse({
    ForStatement: loopHandler,
    ForOfStatement: loopHandler,
    WhileStatement: loopHandler,
    DoWhileStatement: loopHandler,
    enter(path: NodePath<any>) {
      if (path.isBlockStatement() || path.parentPath.isIfStatement()) {
        branchReturnsStack.push(false)
      }
    },
    exit(path: NodePath<any>) {
      if (path.isBlockStatement() || path.parentPath.isIfStatement()) {
        if (branchReturnsStack.pop()) {
          returningBranchFound = true
          if (
            path.parentPath.isIfStatement() &&
            !path.parentPath.has('alternate')
          ) {
            notReturningBranchFound = true
          }
        } else {
          notReturningBranchFound = true
        }
      }
    },
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      if (inLoop) {
        bail = true
        path.stop()
      }
      if (branchReturnsStack.length) {
        branchReturnsStack[branchReturnsStack.length - 1] = true
      }
      path.skip()
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
  if (bail) return null
  return returningBranchFound && notReturningBranchFound
}

export function convertBodyToSingleReturn(
  path: NodePath<t.BlockStatement>,
  outputNeededAs: t.Identifier | null
): t.Expression | null {
  const needsConversion = needsConversionToSingleReturn(path)
  if (needsConversion == null) return null
  if (needsConversion) {
    // TODO
    return null
  } else {
    const finalReturn = getFinalReturn(path)
    if (finalReturn) {
      const { argument } = finalReturn.node
      finalReturn.remove()
      return argument
    } else {
      return t.identifier('undefined')
    }
  }
}

function unboundIdentifier<T>(path: NodePath<T>): t.Identifier {
  let name
  let counter = 0
  do {
    name = `_ASYNCIFY_${counter++}`
  } while (path.scope.getBinding(name) != null)
  return t.identifier(name)
}

function parentStatement<T extends t.Node>(
  path: NodePath<T>
): NodePath<t.Statement> {
  const parent = path.findParent((p: NodePath<t.Node>) => p.isStatement())
  if (!parent) throw new Error('failed to find parent statement')
  return parent as NodePath<t.Statement>
}

function parentFunction<T extends t.Node>(
  path: NodePath<T>
): NodePath<t.Function> {
  const parent = path.findParent((p: NodePath<t.Node>) => p.isFunction())
  if (!parent) throw new Error('failed to find parent function')
  return parent as NodePath<t.Function>
}

function renameBoundIdentifiers<T extends t.Function>(
  handler: NodePath<T>
): void {
  function identifierIsBound(name: string): boolean {
    return handler.scope.hasBinding(name)
  }

  function renameIdentifier(path: NodePath<t.Identifier>): void {
    let newName = path.node.name
    let counter = 0
    while (identifierIsBound(newName))
      newName = `${path.node.name}_ASYNCIFY_${counter++}`
    path.scope.rename(path.node.name, newName)
  }

  function renameIdentifierIfNecessary(path: NodePath<t.Identifier>): void {
    if (identifierIsBound(path.node.name)) {
      renameIdentifier(path)
    }
  }

  const fn = parentFunction(handler)
  const { scope } = fn

  handler.traverse({
    Identifier: (path: NodePath<t.Identifier>) => {
      if (
        path.isBindingIdentifier() &&
        ((scope.hasBinding(path.node.name) &&
          handler.scope.getBindingIdentifier(path.node.name) === path.node) ||
          path.scope.getBinding(path.node.name)?.kind === 'var')
      ) {
        renameIdentifierIfNecessary(path)
      }
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

function replaceLink(
  link: NodePath<t.CallExpression>,
  replacement: t.Expression
): NodePath<any>[] {
  if (link.parentPath.isAwaitExpression())
    return link.parentPath.replaceWith(awaitedIfNecessary(replacement)) as any
  else return link.replaceWith(awaitedIfNecessary(replacement)) as any
}

export function unwindThen(
  handler: NodePath<t.Expression>
): NodePath<t.Expression> {
  const link = handler.parentPath as NodePath<t.CallExpression>
  const callee = link.get('callee')
  if (!callee.isMemberExpression()) {
    throw new Error(`code that uses V8 intrinsic identifiers isn't supported`)
  }
  const { object } = callee.node

  if (handler.isFunction()) {
    renameBoundIdentifiers(handler)

    const body = (handler as NodePath<t.Function>).get('body')

    const fn = handler.node
    const input = (handler as NodePath<t.Function>).get('params')?.[0]

    const statement = parentStatement(link)
    let newPath: NodePath<t.Expression>
    if (input) {
      // TODO use let if values are reassigned
      const declaration = template.statement.ast`const ${
        input.node
      } = ${awaitedIfNecessary(object)}`
      const [replaced]: [
        NodePath<t.VariableDeclaration>
      ] = statement.insertBefore(declaration) as any
      newPath = replaced.get('declarations.0.init.argument') as any
    } else {
      const [replaced]: [
        NodePath<t.ExpressionStatement>
      ] = statement.insertBefore(
        t.expressionStatement(awaitedIfNecessary(object))
      ) as any
      newPath = replaced.get('expression.argument') as any
    }

    if (body.isBlockStatement()) {
      const returnValue = convertBodyToSingleReturn(
        body,
        getOutputIdentifier(link)
      )
      statement.insertBefore(body.node.body)
      if (returnValue) {
        replaceLink(link, returnValue)
      } else {
        if (input.isPattern()) {
          // TODO
        }
        replaceLink(
          link,
          t.callExpression(fn, input.node ? [input.node as any] : [])
        )
      }
    } else if (body.node.type !== 'BlockStatement') {
      replaceLink(link, body.node)
    }
    return newPath
  } else {
    const [replacement] = replaceLink(
      link,
      t.callExpression(handler.node, [awaitedIfNecessary(callee.node)])
    ) as any
    return replacement
  }
}

export function unwindPromiseChain(path: NodePath<t.CallExpression>): void {
  const { scope } = path

  let link: NodePath<t.Expression> | null = path as any

  while (link && link.isCallExpression()) {
    const thenHandler = getThenHandler(link)
    const catchHandler = getCatchHandler(link)
    const finallyHandler = getFinallyHandler(link)

    if (catchHandler) {
      // TODO
      link = null
    } else if (thenHandler) {
      link = unwindThen(thenHandler)
    } else if (finallyHandler) {
      // TODO
      link = null
    } else {
      link = null
    }
    ;(scope as any).crawl()
  }
}

export function unwindPromiseChains(path: NodePath<t.Function>): void {
  path.traverse({
    AwaitExpression(path: NodePath<t.AwaitExpression>) {
      const argument = path.get('argument')
      if (argument.isCallExpression() && isPromiseMethodCall(argument.node)) {
        unwindPromiseChain(argument)
      }
    },
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      const argument = path.get('argument')
      if (argument.isCallExpression() && isPromiseMethodCall(argument.node)) {
        argument.replaceWith(t.awaitExpression(argument.node))
      }
    },
    Function(path: NodePath<t.Function>) {
      path.skip()
    },
  })
}

function asyncifyFunction(path: NodePath<t.Function>): void {
  if (!returnsOrAwaitsPromises(path) && !isPromiseHandler(path)) return
  path.node.async = true
  unwindPromiseChains(path)
}

export default function asyncify(path: NodePath<any>): void {
  path.traverse({
    Function: {
      exit(path: NodePath<t.Function>): void {
        // transform innermost functions first
        asyncifyFunction(path)
      },
    },
  })
}
