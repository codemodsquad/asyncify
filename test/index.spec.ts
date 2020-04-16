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

describe('index', function() {
  testFixtures({
    glob: path.join(__dirname, 'index', '*.ts'),
    transform: require(`../src`),
  })
})
describe('convertConditionalReturns', function() {
  testFixtures({
    glob: path.join(__dirname, 'convertConditionalReturns', '*.ts'),
    transform: function convertConditionalReturnsTransform(
      fileInfo: FileInfo
    ): string | null | undefined | void {
      const ast = parse(fileInfo.source)

      traverse(ast, {
        Function(path: NodePath<t.Function>) {
          const body = path.get('body')
          if (body.isBlockStatement()) convertConditionalReturns(body)
          path.stop()
        },
      })

      return generate(ast as any).code
    },
  })
})
