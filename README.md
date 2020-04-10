# @codemodsquad/asyncify

[![CircleCI](https://circleci.com/gh/codemodsquad/asyncify.svg?style=svg)](https://circleci.com/gh/codemodsquad/asyncify)
[![Coverage Status](https://codecov.io/gh/codemodsquad/asyncify/branch/master/graph/badge.svg)](https://codecov.io/gh/codemodsquad/asyncify)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/%40codemodsquad%2Fasyncify.svg)](https://badge.fury.io/js/%40codemodsquad%2Fasyncify)

transforms promise chains into async/await (work in progress)

# Support table

|                                                                       | `asyncify` (planned) | `async-await-codemod` |
| --------------------------------------------------------------------- | -------------------- | --------------------- |
| Renames identifiers in handlers that would conflict                   | ✅                   | 🚫                    |
| Converts promise chains that aren't returned/awaited into async IIFEs | ✅                   | 🚫                    |
| Converts `return Promise.resolve()`/`return Promise.reject()`         | ✅                   | 🚫                    |
| Warns when the original function could return/throw a non-promise     | ✅                   | 🚫                    |
| **Refactoring/inlining handlers that contain conditional returns**    |                      |                       |
| All but one if/else/switch branch return                              | ✅                   | 🚫                    |
| All but one nested if/else/switch branch return                       | ❓                   | 🚫                    |
| More than one if/else/switch branch doesn't return                    | 🚫                   | 🚫                    |
| Return inside loop                                                    | 🚫                   | 🚫                    |
