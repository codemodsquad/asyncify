import * as t from '@babel/types'
import { NodePath, Scope } from '@babel/traverse'

export default function renameBoundIdentifiers<T extends t.Node>(
  parent: NodePath<T>,
  destScope: Scope
): void {
  function isBound(name: string): boolean {
    return parent.scope.hasBinding(name) || destScope.hasBinding(name)
  }

  function rename(path: NodePath<t.Identifier>): void {
    let newName = path.node.name
    let counter = 0
    while (isBound(newName)) newName = `${path.node.name}${counter++}`
    path.scope.rename(path.node.name, newName)
  }

  function mustRename(path: NodePath<t.Identifier>): boolean {
    const { name } = path.node
    return (
      destScope.hasBinding(name) &&
      path.isBindingIdentifier() &&
      ((destScope.hasBinding(name) &&
        parent.scope.getBindingIdentifier(name) === path.node) ||
        path.scope.getBinding(name)?.kind === 'var')
    )
  }

  if (parent.isIdentifier() && mustRename(parent)) rename(parent)

  parent.traverse(
    {
      Identifier: (path: NodePath<t.Identifier>) => {
        if (mustRename(path)) rename(path)
      },
      Function(path: NodePath<t.Function>) {
        path.skipKey('body')
      },
    },
    parent.state
  )
}
