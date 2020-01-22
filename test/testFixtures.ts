/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { it } from 'mocha'
import { expect } from 'chai'
import requireGlob from 'require-glob'
import jscodeshift, { Transform } from 'jscodeshift'
import * as path from 'path'
import pkgConf from 'pkg-conf'
import * as prettier from 'prettier'

const prettierOptions = { ...pkgConf.sync('prettier'), parser: 'babel' }
const normalize = (code: string): string =>
  prettier.format(code, prettierOptions).trim()

export default function textFixtures({
  glob,
  transform,
  transformOptions,
  defaultParser,
}: {
  glob: string
  transform: Transform
  transformOptions?: Record<string, any>
  defaultParser?: string
}): void {
  if (!path.isAbsolute(glob)) {
    throw new Error('glob must be absolute')
  }
  const fixtures = requireGlob.sync(glob, {
    reducer: (
      options: Record<string, any>,
      result: Record<string, any>,
      file: { path: string; exports: any }
    ) => {
      result[file.path] = file.exports
      return result
    },
  })
  for (const fixturePath in fixtures) {
    const fixture = fixtures[fixturePath]
    const { input, expected } = fixture
    const file = path.resolve(
      __dirname,
      fixture.file
        ? path.resolve(path.dirname(fixturePath), fixture.file)
        : fixturePath
    )
    const position = input.indexOf('// position')
    let selectionStart = input.indexOf('// selectionStart')
    let selectionEnd = input.indexOf('// selectionEnd')
    if (selectionStart < 0) selectionStart = position
    if (selectionEnd < 0) selectionEnd = position
    const options = { ...transformOptions, ...fixture.options }
    if (selectionStart >= 0 && selectionEnd >= 0) {
      Object.assign(options, { selectionStart, selectionEnd })
    }
    it(path.basename(fixturePath).replace(/\.js$/, ''), function() {
      const source = input.replace(
        /^\s*\/\/\s*(position|selectionStart|selectionEnd).*(\r\n?|\n)/gm,
        ''
      )
      const stats: Record<string, number> = {}
      const report = []
      const parser = fixture.parser || defaultParser
      const j = parser ? jscodeshift.withParser(parser) : jscodeshift
      const result = transform(
        { path: file, source },
        {
          j,
          jscodeshift: j,
          stats: (name: string, quantity = 1): void => {
            const total = stats[name]
            stats[name] = total != null ? total + quantity : quantity
          },
          report: (msg: string) => report.push(msg),
        },
        options
      )
      if (!result) expect(result).to.equal(fixture.expected)
      else expect(normalize(result)).to.equal(normalize(expected))
      if (fixture.stats) expect(stats).to.deep.equal(fixture.stats)
      if (fixture.report) expect(report).to.deep.equal(fixture.report)
    })
  }
}
