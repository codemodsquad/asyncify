import * as t from '@babel/types'
import { NodePath } from '@babel/traverse'

import parentStatement from './parentStatement'

export default function removeRestOfBlockStatement(
  path: NodePath<any>
): t.Statement[] {
  const statement = parentStatement(path)
  const blockStatement = statement.parentPath
  if (!blockStatement.isBlockStatement())
    throw new Error('failed to get BlockStatement')
  const body = (blockStatement as NodePath<t.BlockStatement>).get('body')
  const index = body.indexOf(statement)
  if (index < 0)
    throw new Error('failed to get index of Statement within BlockStatement')
  const rest = body.slice(index + 1)
  const statements = rest.map(p => p.node)
  rest.forEach(p => p.remove())
  return statements
}
