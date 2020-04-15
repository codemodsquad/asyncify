import { FileInfo, API, Options } from 'jscodeshift'
import traverse, { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import asyncify from './asyncify'
import { parse } from '@babel/parser'
import generate from '@babel/generator'

module.exports = function index(
  fileInfo: FileInfo,
  api: API,
  options: Options
): string | null | undefined | void {
  const ast = parse(fileInfo.source)

  const ignoreChainsShorterThan = parseInt(options.ignoreChainsShorterThan)

  traverse(
    ast,
    {
      Program(path: NodePath<t.Program>) {
        asyncify(path)
        path.stop()
      },
    },
    undefined,
    { ignoreChainsShorterThan }
  )

  return generate(ast as any).code
}
