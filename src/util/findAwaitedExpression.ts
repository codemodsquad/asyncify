import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

export default function findAwaitedExpression(
  paths: NodePath | NodePath[]
): NodePath<t.Expression> | null {
  if (Array.isArray(paths)) {
    for (const path of paths) {
      const result = findAwaitedExpression(path)
      if (result) return result
    }
    return null
  }
  let result: NodePath<t.Expression> | null = null
  paths.traverse(
    {
      AwaitExpression(path: NodePath<t.AwaitExpression>) {
        if (result == null) result = path.get('argument')
        path.stop()
      },
      Function(path: NodePath<t.Function>) {
        path.skip()
      },
    },
    paths.state
  )
  return result
}
