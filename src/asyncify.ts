import { NodePath } from '@babel/traverse'
import {
  Function,
  FunctionExpression,
  ArrowFunctionExpression,
  AwaitExpression,
  ReturnStatement,
  CallExpression,
  MemberExpression,
  Node,
  Statement,
  Expression,
  BlockStatement,
  Identifier,
  VariableDeclarator,
  ArrayPattern,
  ObjectProperty,
  Pattern,
} from '@babel/types'
import template from '@babel/template'
import * as t from '@babel/types'

let idCounter = 0

export function _resetIdCounterForTests() {
  idCounter = 0
}

function isNullish(node: Node): boolean {
  return (
    node.type === 'NullLiteral' ||
    (node.type === 'Identifier' && node.name === 'undefined')
  )
}

export default function asyncify(path: NodePath<any>): void {
  path.traverse({
    Function: {
      exit(path: NodePath<Function>) {
        // transform innermost functions first
        asyncifyFunction(path)
      },
    },
  })
}

export function isPromiseMethodCall(node: Node): boolean {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.property.type === 'Identifier' &&
    (node.callee.property.name === 'then' ||
      node.callee.property.name === 'catch' ||
      node.callee.property.name === 'finally')
  )
}

export function isPromiseValued(node: Node): boolean {
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

export function returnsOrAwaitsPromises(path: NodePath<Function>): boolean {
  let result = false
  const body = path.get('body')
  if (!body.isBlockStatement()) {
    return isPromiseValued(body.node)
  }
  body.traverse({
    AwaitExpression(path: NodePath<AwaitExpression>) {
      result = true
      path.stop()
    },
    ReturnStatement(path: NodePath<ReturnStatement>) {
      const {
        node: { argument },
      } = path
      if (argument && isPromiseValued(argument)) {
        result = true
        path.stop()
      }
    },
    Function(path: NodePath<Function>) {
      path.skip()
    },
  })
  return result
}

export function isPromiseHandler(path: NodePath<Function>): boolean {
  return isPromiseValued(path.parentPath.node)
}

export function convertBodyToBlockStatement(path: NodePath<Function>): void {
  path
    .get('body')
    .replaceWith(
      t.blockStatement(template.statements.ast`return ${path.node.body}`)
    )
}

export function awaitedIfNecessary(node: Expression) {
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

export function addAwaitIfNecessary(path: NodePath<Expression>): void {
  path.replaceWith(awaitedIfNecessary(path.node))
}

export function addAwaitToReturnStatements(path: NodePath<Function>): void {
  path.get('body').traverse({
    ReturnStatement(path: NodePath<ReturnStatement>) {
      const { argument } = path.node
      if (argument && argument.type !== 'AwaitExpression') {
        addAwaitIfNecessary(path.get('argument') as NodePath<Expression>)
      }
      path.skip()
    },
    Function(path: NodePath<Function>) {
      path.skip()
    },
  })
}

export function getThenHandler(
  path: NodePath<CallExpression>
): NodePath<Expression> | null {
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
  path: NodePath<CallExpression>
): NodePath<Expression> | null {
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
  path: NodePath<CallExpression>
): NodePath<Expression> | null {
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
  path: NodePath<CallExpression>
): NodePath<CallExpression> | null {
  const callee = path.get('callee')
  if (callee.isMemberExpression()) {
    const object = (callee as NodePath<MemberExpression>).get('object')
    if (isPromiseMethodCall(object.node)) {
      return object as NodePath<CallExpression>
    }
  }
  return null
}

export function getFinalReturn(
  path: NodePath<BlockStatement>
): NodePath<ReturnStatement> | null {
  const body = path.get('body')
  const lastStatement = body[body.length - 1]
  return lastStatement && lastStatement.isReturnStatement()
    ? lastStatement
    : null
}

export function needsConversionToSingleReturn(
  path: NodePath<BlockStatement>
): boolean | null {
  let bail = false
  const branchReturnsStack: Array<boolean> = []
  let returningBranchFound = false
  let notReturningBranchFound = false
  let inLoop = 0
  const loopHandler = {
    enter() {
      inLoop++
    },
    exit() {
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
    ReturnStatement(path: NodePath<ReturnStatement>) {
      if (inLoop) {
        bail = true
        path.stop()
      }
      if (branchReturnsStack.length) {
        branchReturnsStack[branchReturnsStack.length - 1] = true
      }
      path.skip()
    },
    Function(path: NodePath<Function>) {
      path.skip()
    },
  })
  if (bail) return null
  return returningBranchFound && notReturningBranchFound
}

export function convertBodyToSingleReturn(
  path: NodePath<BlockStatement>,
  outputNeededAs: Identifier | null
): Expression | null {
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

export class Unwinder {
  statements: Statement[]
  returnValue: Expression
  private identifierIsBoundExternally: (identifier: string) => boolean
  private newBindings: Set<string> = new Set()

  constructor({
    statements,
    returnValue,
    identifierIsBound,
  }: {
    statements: Statement[]
    returnValue: Expression
    identifierIsBound?: (identifier: string) => boolean
  }) {
    this.statements = statements
    this.returnValue = returnValue
    this.identifierIsBoundExternally =
      identifierIsBound || ((identifier: string) => false)
  }

  private identifierIsBound(identifier: string) {
    return (
      this.identifierIsBoundExternally(identifier) ||
      this.newBindings.has(identifier)
    )
  }

  private renameIdentifier(path: NodePath<Identifier>): void {
    let newName = path.node.name
    while (this.identifierIsBound(newName))
      newName = `${path.node.name}_asyncify_${idCounter++}`
    this.newBindings.add(newName)
    path.scope.rename(path.node.name, newName)
  }

  private renameIdentifierIfNecessary(path: NodePath<Identifier>): void {
    if (this.identifierIsBound(path.node.name)) {
      this.renameIdentifier(path)
    } else {
      this.newBindings.add(path.node.name)
    }
  }

  // private renameIdentifiersIfNecessary(path: NodePath<any>): void {
  //   if (path.isIdentifier()) {
  //     this.renameIdentifierIfNecessary(path)
  //   } else if (path.isArrayPattern()) {
  //     const elements = path.get('elements')
  //     if (Array.isArray(elements)) {
  //       for (const element of elements) {
  //         if (element) this.renameIdentifiersIfNecessary(element)
  //       }
  //     }
  //   } else if (path.isObjectPattern()) {
  //     const properties = path.get('properties')
  //     if (Array.isArray(properties)) {
  //       for (const property of properties) {
  //         this.renameIdentifiersIfNecessary(property)
  //       }
  //     }
  //   } else if (path.isObjectProperty()) {
  //     this.renameIdentifiersIfNecessary(path.get('value'))
  //   } else if (path.isAssignmentPattern()) {
  //     this.renameIdentifiersIfNecessary(path.get('left'))
  //   } else if (path.isRestElement()) {
  //     this.renameIdentifiersIfNecessary(path.get('argument'))
  //   }
  // }

  private renameBoundIdentifiers(handler: NodePath<Function>): void {
    // const param = handler.get('params')[0]
    // if (param) {
    //   this.renameIdentifiersIfNecessary(param)
    // }

    // handler.get('body').traverse({
    //   VariableDeclarator: (path: NodePath<VariableDeclarator>) => {
    //     this.renameIdentifiersIfNecessary(path.get('id'))
    //     path.skip()
    //   },
    //   BlockStatement(path: NodePath<BlockStatement>) {
    //     path.skip()
    //   },
    //   Function(path: NodePath<Function>) {
    //     path.skip()
    //   },
    // })

    // TODO handle var properly
    handler.traverse({
      Identifier: (path: NodePath<Identifier>) => {
        if (path.scope.getBindingIdentifier(path.node.name) === path.node) {
          this.renameIdentifierIfNecessary(path)
        }
      },
      BlockStatement(path: NodePath<BlockStatement>) {
        if (path.parentPath !== handler) path.skip()
      },
      Function(path: NodePath<Function>) {
        path.skip()
      },
    })
  }

  private declareHandlerParams(handler: Function): void {
    const [input] = handler.params
    if (input) {
      const { returnValue } = this
      if (
        input.type !== 'Identifier' ||
        returnValue.type !== 'Identifier' ||
        input.name !== returnValue.name
      ) {
        this.statements.push(
          template.statement.ast`const ${input} = ${awaitedIfNecessary(
            returnValue
          )}`
        )
      }
    } else if (this.returnValue.type === 'AwaitExpression') {
      this.statements.push(t.expressionStatement(this.returnValue))
    }
  }

  unwind(
    method: NodePath<CallExpression>,
    outputNeededAs: Identifier | null
  ): void {
    const thenHandler = getThenHandler(method)
    const catchHandler = getCatchHandler(method)
    const finallyHandler = getFinallyHandler(method)
    if (thenHandler) {
      this.unwindThen(thenHandler, outputNeededAs)
    }
    if (catchHandler) {
      this.unwindCatch(catchHandler, outputNeededAs)
    }
    if (finallyHandler) {
      this.unwindFinally(finallyHandler, outputNeededAs)
    }
  }

  unwindThen(
    handler: NodePath<Expression>,
    outputNeededAs: Identifier | null
  ): void {
    if (handler.isFunction()) {
      this.renameBoundIdentifiers(handler)
      const fnPath = handler as
        | NodePath<FunctionExpression>
        | NodePath<ArrowFunctionExpression>
      const fn = fnPath.node
      if (fn.body.type === 'BlockStatement') {
        const returnValue = convertBodyToSingleReturn(
          fnPath.get('body') as NodePath<BlockStatement>,
          outputNeededAs
        )
        if (returnValue) {
          this.declareHandlerParams(fn)
          this.returnValue = returnValue
          for (const statement of fn.body.body) this.statements.push(statement)
        } else {
          this.returnValue = t.awaitExpression(
            t.callExpression(fn, fn.params.length ? [this.returnValue] : [])
          )
        }
      } else {
        this.declareHandlerParams(fn)
        this.returnValue = awaitedIfNecessary(fn.body)
      }
    } else if (!isNullish(handler.node)) {
      this.returnValue = template.expression
        .ast`${handler}(${this.returnValue})`
    }
  }

  unwindCatch(
    path: NodePath<Expression>,
    outputNeededAs: Identifier | null
  ): void {}

  unwindFinally(
    path: NodePath<Expression>,
    outputNeededAs: Identifier | null
  ): void {}
}

function getOutputNeededAs(
  promiseMethodCallStack: NodePath<CallExpression>[],
  finalOutputNeededAs: Identifier | null
): Identifier | null {
  for (let i = promiseMethodCallStack.length - 1; i >= 0; i--) {
    const thenHandler = getThenHandler(promiseMethodCallStack[i])
    if (thenHandler) {
      if (thenHandler.isFunction()) {
        const [param] = thenHandler.node.params
        if (param.type === 'Identifier') return param
        return t.identifier(`_asyncify_${idCounter++}`)
      }
    }
  }
  return finalOutputNeededAs
}

export function unwindPromiseChainStatements(
  path: NodePath<CallExpression>,
  finalOutputNeededAs: Identifier | null
): Unwinder {
  const promiseMethodCallStack: NodePath<CallExpression>[] = []
  let walkedPath: NodePath<CallExpression> | null = path
  while (walkedPath) {
    promiseMethodCallStack.push(walkedPath)
    walkedPath = preceedingPromiseMethodCall(walkedPath)
  }

  if (!promiseMethodCallStack.length) {
    throw new Error('path must be a promise method call')
  }

  const firstCallee =
    promiseMethodCallStack[promiseMethodCallStack.length - 1].node.callee
  if (firstCallee.type !== 'MemberExpression') {
    throw new Error('unexpected')
  }

  const unwinder = new Unwinder({
    statements: [],
    returnValue: awaitedIfNecessary(firstCallee.object),
    identifierIsBound: (identifier: string) =>
      path.scope.getBinding(identifier) != null,
  })

  while (promiseMethodCallStack.length) {
    const method = promiseMethodCallStack.pop()
    if (!method) break
    const outputNeededAs = getOutputNeededAs(
      promiseMethodCallStack,
      finalOutputNeededAs
    )
    const thenHandler = getThenHandler(method)
    const catchHandler = getCatchHandler(method)
    const finallyHandler = getFinallyHandler(method)
    if (thenHandler) {
      unwinder.unwindThen(thenHandler, outputNeededAs)
    }
    if (catchHandler) {
      unwinder.unwindCatch(catchHandler, outputNeededAs)
    }
    if (finallyHandler) {
      unwinder.unwindFinally(finallyHandler, outputNeededAs)
    }
  }

  return unwinder
}

function unboundIdentifier(path: NodePath<any>): Identifier {
  let name
  do {
    name = `_asyncify_${idCounter++}`
  } while (path.scope.getBinding(name) != null)
  return t.identifier(name)
}

function parentStatement(path: NodePath<Node>): NodePath<Statement> {
  let p: NodePath<any> | null = path
  while (p && !p.isStatement() && !p.isFunction()) p = p.parentPath
  if (!p || !p.isStatement()) {
    throw new Error('failed to find parent statement')
  }
  return p
}

export function unwindPromiseChain(path: NodePath<CallExpression>): void {
  let { parentPath } = path
  if (parentPath.isAwaitExpression()) parentPath = parentPath.parentPath
  if (parentPath.isExpressionStatement()) {
    const { statements } = unwindPromiseChainStatements(path, null)
    parentPath.insertBefore(statements)
    parentPath.remove()
  } else if (parentPath.isReturnStatement()) {
    const { statements, returnValue } = unwindPromiseChainStatements(
      path,
      unboundIdentifier(path)
    )
    parentPath.insertBefore(statements)
    parentPath.get('argument').replaceWith(returnValue)
  } else {
    const { statements, returnValue } = unwindPromiseChainStatements(
      path,
      unboundIdentifier(path)
    )
    parentStatement(parentPath).insertBefore(statements)
    parentPath.replaceWith(returnValue)
  }
}

export function unwindPromiseChains(path: NodePath<Function>): void {
  path.traverse({
    AwaitExpression(path: NodePath<AwaitExpression>) {
      if (isPromiseMethodCall(path.node.argument)) {
        unwindPromiseChain(path.get('argument') as NodePath<CallExpression>)
      }
    },
    ReturnStatement(path: NodePath<ReturnStatement>) {
      if (isPromiseMethodCall(path.node.argument)) {
        unwindPromiseChain(path.get('argument') as NodePath<CallExpression>)
      }
    },
    Function(path: NodePath<Function>) {
      path.skip()
    },
  })
}

function asyncifyFunction(path: NodePath<Function>): void {
  if (!returnsOrAwaitsPromises(path) && !isPromiseHandler(path)) return
  path.node.async = true
  unwindPromiseChains(path)
}
