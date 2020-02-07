/* eslint-disable @typescript-eslint/no-var-requires */

import { describe } from 'mocha'
import * as fs from 'fs'
import * as path from 'path'
import testFixtures from './testFixtures'

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
