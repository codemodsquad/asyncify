// import { describe } from 'mocha'
// import { expect } from 'chai'
// import * as t from '@babel/types'
// import template from '@babel/template'
// import traverse, { NodePath } from '@babel/traverse'
// import generate from '@babel/generator'
// import * as parser from '@babel/parser'
// import {
//   Unwinder,
//   needsConversionToSingleReturn,
// } from './asyncify'

// function expectUnwinderOutput(
//   actual: Unwinder,
//   expected: {
//     statements: t.Statement[]
//     returnValue: t.Expression
//   }
// ): void {
//   expect(
//     actual.statements.map(s => generate(s as any).code).join('\n')
//   ).to.equal(
//     expected.statements.map(s => generate(s as any).code).join('\n'),
//     'statements'
//   )
//   expect(generate(actual.returnValue as any).code).to.equal(
//     generate(expected.returnValue as any).code,
//     'returnValue'
//   )
// }

// function programPath(code: string): NodePath<t.Program> {
//   const ast = parser.parse(`
//   async function fn() {
//     ${code}
//   }
//   `)
//   let result: NodePath<t.Program> | null = null
//   traverse(ast, {
//     Program(path: NodePath<t.Program>) {
//       result = path
//       path.stop()
//     },
//   })
//   if (!result) {
//     throw new Error(`failed to find Program`)
//   }
//   return result
// }

// function callExpressionPath(code: string): NodePath<t.CallExpression> {
//   const ast = parser.parse(`
//   async function fn() {
//     ${code}
//   }
//   `)
//   let result: NodePath<t.CallExpression> | null = null
//   traverse(ast, {
//     CallExpression(path: NodePath<t.CallExpression>) {
//       result = path
//       path.stop()
//     },
//   })
//   if (!result) {
//     throw new Error(`failed to find CallExpression`)
//   }
//   return result
// }

// function blockStatementPath(innerCode: string): NodePath<t.BlockStatement> {
//   const ast = parser.parse(`
//   async function fn() {
//     ${innerCode}
//   }
//   `)
//   let result: NodePath<t.BlockStatement> | null = null
//   traverse(ast, {
//     BlockStatement(path: NodePath<t.BlockStatement>) {
//       result = path
//       path.stop()
//     },
//   })
//   if (!result) {
//     throw new Error(`failed to find BlockStatement`)
//   }
//   return result
// }

// describe(`asyncify`, function() {
//   describe(`needsConversionToSingleReturn`, function() {
//     it(`no branches return`, async function() {
//       expect(
//         needsConversionToSingleReturn(
//           blockStatementPath(`
//         if (foo) {
//           console.log('foo')
//         } else if (baz) {
//           if (qux) {
//             console.log('bar')
//           } else {
//             console.log('baz')
//           }
//         }
//         `)
//         )
//       ).to.be.false
//     })
//   })
//   describe(`Unwinder.unwindThen`, function() {
//     it(`when body is Expression`, async function() {
//       const context = new Unwinder({
//         statements: [],
//         returnValue: t.awaitExpression(t.identifier('foo')),
//       })
//       const path = callExpressionPath(`foo.then(x => x * 2)`)
//       context.unwind(path, t.identifier('out'))

//       expectUnwinderOutput(context, {
//         statements: template.statements.ast`
//           const x = ${t.awaitExpression(t.identifier('foo'))}
//           `,
//         returnValue: template.expression.ast`x * 2`,
//       })
//       expect(context.statements).to.have.lengthOf(1)
//     })
//     it(`when body is Expression, input already assigned`, async function() {
//       const context = new Unwinder({
//         statements: [],
//         returnValue: t.identifier('x'),
//       })
//       const path = callExpressionPath(`foo.then(x => x * 2)`)
//       context.unwind(path, t.identifier('out'))

//       expectUnwinderOutput(context, {
//         statements: [],
//         returnValue: template.expression.ast`x * 2`,
//       })
//       expect(context.statements).to.have.lengthOf(0)
//     })
//     it(`when body is Expression, destructuring input`, async function() {
//       const context = new Unwinder({
//         statements: [],
//         returnValue: t.awaitExpression(t.identifier('foo')),
//       })
//       const path = callExpressionPath(`foo.then(({x}) => x * 2)`)
//       context.unwind(path, t.identifier('out'))

//       expectUnwinderOutput(context, {
//         statements: template.statements.ast`
//           const {x} = ${t.awaitExpression(t.identifier('foo'))}
//           `,
//         returnValue: template.expression.ast`x * 2`,
//       })
//       expect(context.statements).to.have.lengthOf(1)
//     })
//     it(`when body is Expression, no input`, async function() {
//       const context = new Unwinder({
//         statements: [],
//         returnValue: t.awaitExpression(t.identifier('foo')),
//       })
//       const path = callExpressionPath(`foo.then(() => this)`)
//       context.unwind(path, t.identifier('out'))

//       expectUnwinderOutput(context, {
//         statements: template.statements.ast`
//           ${t.expressionStatement(t.awaitExpression(t.identifier('foo')))}
//           `,
//         returnValue: t.thisExpression(),
//       })
//       expect(context.statements).to.have.lengthOf(1)
//     })
//     it(`when body is Block Statement with single return`, async function() {
//       const context = new Unwinder({
//         statements: [],
//         returnValue: t.awaitExpression(t.identifier('foo')),
//       })
//       const path = callExpressionPath(`foo.then(x => {
//         console.log('test')
//         return x * 2
//       })`)
//       context.unwind(path, t.identifier('out'))

//       expectUnwinderOutput(context, {
//         statements: template.statements.ast`
//           const x = ${t.awaitExpression(t.identifier('foo'))}
//           console.log('test')
//           `,
//         returnValue: template.expression.ast`x * 2`,
//       })
//       expect(context.statements).to.have.lengthOf(2)
//     })
//     it(`when body is Block Statement with no return`, async function() {
//       const context = new Unwinder({
//         statements: [],
//         returnValue: t.awaitExpression(t.identifier('foo')),
//       })
//       const path = callExpressionPath(`foo.then(() => {
//         console.log('test')
//       })`)
//       context.unwind(path, t.identifier('out'))

//       expectUnwinderOutput(context, {
//         statements: template.statements.ast`
//           ${t.awaitExpression(t.identifier('foo'))}
//           console.log('test')
//           `,
//         returnValue: t.identifier('undefined'),
//       })
//       expect(context.statements).to.have.lengthOf(2)
//     })
//     it(`when body is Block Statement that won't be converted to single return`, async function() {
//       const context = new Unwinder({
//         statements: [],
//         returnValue: t.awaitExpression(t.identifier('foo')),
//       })
//       const path = callExpressionPath(`foo.then(bar => {
//         for (const x of bar) {
//           if (x === 2) return x
//         }
//       })`)
//       context.unwind(path, t.identifier('out'))

//       expectUnwinderOutput(context, {
//         statements: [],
//         returnValue: t.awaitExpression(template.expression.ast`
//             (bar => {
//               for (const x of bar) {
//                 if (x === 2) return x
//               }
//             })(${t.awaitExpression(t.identifier('foo'))})
//           `),
//       })
//       expect(context.statements).to.have.lengthOf(0)
//     })
//     it(`renames identifiers as necessary`, async function() {
//       const context = new Unwinder({
//         statements: [],
//         returnValue: t.awaitExpression(t.identifier('foo')),
//         identifierIsBound: id => id === 'bar' || id === 'baz' || id === 'qux',
//       })
//       const path = callExpressionPath(`foo.then(bar => {
//         try {
//           const qux = 3
//           console.log(qux + bar)
//         } catch (baz) {
//           console.log(baz)
//         }
//         const dude = 3
//         const qux = 4
//         return qux + dude
//       })`)
//       context.unwind(path, t.identifier('out'))

//       expectUnwinderOutput(context, {
//         statements: template.statements.ast`
//           const bar_asyncify_0 = ${t.awaitExpression(t.identifier('foo'))}
//           try {
//             const qux = 3
//             console.log(qux + bar_asyncify_0)
//           } catch (baz) {
//             console.log(baz)
//           }
//           const dude = 3
//           const qux_asyncify_1 = 4
//           `,
//         returnValue: template.expression.ast`qux_asyncify_1 + dude`,
//       })
//     })
//   })
// })
