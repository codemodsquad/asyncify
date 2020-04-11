import { FileInfo } from 'jscodeshift'
import chooseParser from 'jscodeshift-choose-parser'
import traverse, { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import asyncify from './asyncify'
import { parse } from '@babel/parser'
import generate from '@babel/generator'

function getParser(file: string): (code: string) => t.Node {
  if (process.env.BABEL_ENV === 'test') {
    return parse
  }
  const parser = chooseParser(file)
  if (!parser || typeof parser === 'string') {
    throw new Error('TODO')
  }
  return parser.parse as any
}

module.exports = function index(
  fileInfo: FileInfo
): string | null | undefined | void {
  const parse = getParser(fileInfo.path)
  const ast = parse(fileInfo.source)

  traverse(ast, {
    Program(path: NodePath<t.Program>) {
      asyncify(path)
      path.stop()
    },
  })

  return generate(ast as any).code
}
