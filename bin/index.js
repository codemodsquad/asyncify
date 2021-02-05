#!/usr/bin/env node

const child = require('child_process').spawn(
  'jscodeshift',
  ['-t', require.resolve('..'), ...process.argv.slice(2)],
  { stdio: 'inherit' }
)

child.on('error', error => {
  // eslint-disable-next-line no-console
  console.error(error.stack)
  process.exit(1)
})
child.on('close', (code, signal) => {
  if (code != 0) {
    process.exit(code)
  }
  if (signal) {
    process.exit(1)
  }
  process.exit(0)
})
