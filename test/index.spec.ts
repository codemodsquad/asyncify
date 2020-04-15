/* eslint-disable @typescript-eslint/no-var-requires */

import * as fs from 'fs'
import * as path from 'path'
import testFixtures from './testFixtures'

describe('index', function() {
  testFixtures({
    glob: path.join(__dirname, 'index', '*.ts'),
    transform: require(`../src`),
  })
})
