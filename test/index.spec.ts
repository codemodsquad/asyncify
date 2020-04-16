/* eslint-disable @typescript-eslint/no-var-requires */

import * as path from 'path'
import testFixtures from './testFixtures'
import { FileInfo } from 'jscodeshift'
import { parse } from '@babel/parser'
import * as t from '@babel/types'
import traverse, { NodePath } from '@babel/traverse'
import generate from '@babel/generator'
import convertConditionalReturns from '../src/util/convertConditionalReturns'
import dump from './dump'
global.dump = dump

describe('asyncify', function() {
  testFixtures({
    glob: path.join(__dirname, 'fixtures', '*.ts'),
    transform: require(`../src`),
  })
})
