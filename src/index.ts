import { FileInfo, API, Options } from 'jscodeshift'
import traverse, { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import asyncify from './asyncify'
import * as recast from 'recast'
import recastBugWorkarounds from './util/recastBugWorkarounds'

module.exports = function index(
  fileInfo: FileInfo,
  api: API,
  options: Options
): string | null | undefined | void {
  const ast = recast.parse(fileInfo.source, {
    parser: require('recast/parsers/babel'),
  })

  const ignoreChainsShorterThan = parseInt(options.ignoreChainsShorterThan)

  let program: NodePath<t.Program> | undefined
  traverse(
    ast,
    {
      Program(path: NodePath<t.Program>) {
        program = path
        path.stop()
      },
    },
    undefined,
    { ignoreChainsShorterThan }
  )
  if (!program) throw new Error('failed to find Program node')
  asyncify(program)
  recastBugWorkarounds(program)
  return recast.print(ast).code
}
