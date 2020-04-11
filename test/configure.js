/* eslint-disable */

const chai = require('chai')
chai.use(require('chai-subset'))
require('@babel/register')({ extensions: ['.js', '.ts'] })

if (process.argv.indexOf('--watch') >= 0) {
  require('./clearConsole')
}
