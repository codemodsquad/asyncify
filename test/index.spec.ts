/* eslint-disable @typescript-eslint/no-var-requires */

import * as fs from 'fs'
import * as path from 'path'
import testFixtures from './testFixtures'
import { _resetIdCounterForTests } from '../src/asyncify'

beforeEach(() => {
  _resetIdCounterForTests()
})

const dirs = fs.readdirSync(__dirname)
for (const dir of dirs) {
  if (fs.statSync(path.join(__dirname, dir)).isDirectory()) {
    describe(dir, function() {
      testFixtures({
        glob: path.join(__dirname, dir, '*.ts'),
        transform: require(`../src/${dir}`),
      })
    })
  }
}
