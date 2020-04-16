/* eslint-disable @typescript-eslint/no-var-requires */

import * as path from 'path'
import testFixtures from './testFixtures'
import dump from './dump'
global.dump = dump

describe('asyncify', function() {
  testFixtures({
    glob: path.join(__dirname, 'fixtures', '*.ts'),
    transform: require(`../src`),
  })
})
