import * as fs from 'fs'
import * as path from 'path'

export const input = fs.readFileSync(
  require.resolve('./sequelize/model'),
  'utf8'
)

export const expected = ``
