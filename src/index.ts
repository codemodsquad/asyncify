import { FileInfo, API, Options } from 'jscodeshift'
import traverse, { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import asyncify from './asyncify'
import recastBugWorkarounds from './util/recastBugWorkarounds'

module.exports = function index(
  fileInfo: FileInfo,
  api: API,
  options: Options
): string | null | undefined | void {
  const j = api.jscodeshift(fileInfo.source);
  const ast = j.get().value;

  const ignoreChainsShorterThan = parseInt(options.ignoreChainsShorterThan)
  const commentWorkarounds = options.commentWorkarounds

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
    { ignoreChainsShorterThan, commentWorkarounds }
  )
  if (!program) throw new Error('failed to find Program node')
  asyncify(program)
  recastBugWorkarounds(program)
  return j.toSource()
}
