import * as t from '@babel/traverse'
import { NodePath, NodePaths } from '@babel/traverse'
import parentStatement from './util/parentStatement'
import convertBodyToBlockStatement from './util/convertBodyToBlockStatement'

export default function insertBeforeParentStatement<
  Nodes extends t.Node | t.Node[]
>(path: NodePath<any>, nodes: Nodes): NodePaths<Nodes> {
  const statement = parentStatement(path)
  if (statement.parentPath.isFunction()) {
    return convertBodyToBlockStatement(statement.parentPath).unshiftContainer(
      'body',
      nodes
    )
  } else {
    return statement.insertBefore(nodes)
  }
}
