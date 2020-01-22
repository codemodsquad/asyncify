/* eslint-disable @typescript-eslint/no-var-requires */

import { describe } from 'mocha'
import * as path from 'path'
import testFixtures from '../testFixtures'
const example = require('../../src/example')

describe(`example`, function() {
  testFixtures({
    glob: path.join(__dirname, 'fixtures', '*.ts'),
    transform: example,
  })
})
