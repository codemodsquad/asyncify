import * as t from '@babel/types'
import { NodePath, NodePaths } from '@babel/traverse'
import convertBodyToBlockStatement from './convertBodyToBlockStatement'

export default function prependBodyStatement<
  T extends t.Function,
  S extends t.Statement
>(func: NodePath<T>, statement: S): NodePaths<S[]> {
  return convertBodyToBlockStatement(func).unshiftContainer('body', [statement])
}
