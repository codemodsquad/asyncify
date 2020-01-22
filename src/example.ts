import { ASTPath, Node, FileInfo, API, Options } from 'jscodeshift'
import pathsInRange from 'jscodeshift-paths-in-range'

type Filter = (
  path: ASTPath<Node>,
  index: number,
  paths: Array<ASTPath<Node>>
) => boolean

module.exports = function example(
  fileInfo: FileInfo,
  api: API,
  options: Options
): string | null | undefined | void {
  const j = api.jscodeshift

  const { statement } = j.template
  const root = j(fileInfo.source)

  let filter: Filter
  if (options.selectionStart) {
    const selectionStart = parseInt(options.selectionStart)
    const selectionEnd = options.selectionEnd
      ? parseInt(options.selectionEnd)
      : selectionStart
    filter = pathsInRange(selectionStart, selectionEnd)
  } else {
    filter = (): boolean => true
  }
  return root
    .find(j.FunctionDeclaration)
    .filter(filter)
    .insertBefore(statement`console.log('hello world')`)
    .toSource()
}
