/* eslint disable */

const { name: pkgName } = require('../package.json')
const [transformName, fixture] = process.argv.slice(2)
if (!transformName || !fixture) {
  console.error('Usage: yarn example <transform> <fixture>')
  process.exit(1)
}

const { input, expected, file } = require(require.resolve(
  `../test/${transformName}/${fixture}.ts`
))

const ext = file ? /^\.([^.]+)$/.exec(file)?.[1] || 'ts' : 'ts'

console.log(`### Before

\`\`\`${ext}
${input}
\`\`\`

### Command
\`\`\`
jscodeshift -t path/to/${pkgName}/${transformName}.js <file>
\`\`\`

### After

\`\`\`${ext}
${expected}
\`\`\`
`)
