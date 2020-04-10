import { FileInfo } from 'jscodeshift'
import chooseParser from 'jscodeshift-choose-parser'
import traverse, { NodePath } from '@babel/traverse'
import { Node, Program } from '@babel/types'
import asyncify from './asyncify'
import generate from '@babel/generator'

function getParser(file: string): (code: string) => Node {
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
    Program(path: NodePath<Program>) {
      path.stop()
      asyncify(path)
    },
  })

  return generate(ast as any).code
}
