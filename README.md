# @codemodsquad/asyncify

[![CircleCI](https://circleci.com/gh/codemodsquad/asyncify.svg?style=svg)](https://circleci.com/gh/codemodsquad/asyncify)
[![Coverage Status](https://codecov.io/gh/codemodsquad/asyncify/branch/master/graph/badge.svg)](https://codecov.io/gh/codemodsquad/asyncify)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/%40codemodsquad%2Fasyncify.svg)](https://badge.fury.io/js/%40codemodsquad%2Fasyncify)

Transforms promise chains into `async`/`await`. I wrote this to refactor the 5000+ `.then`/`.catch`/`.finally` calls in the
`sequelize` codebase. This is slightly inspired by [async-await-codemod](https://github.com/sgilroy/async-await-codemod),
but written from scratch to guarantee the same behavior and tidy code as best as I can manage.

## Usage

```
npx @codemodsquad/asyncify path/to/your/project/**/*.js
```

This command just forwards to `jscodeshift`, you can pass other `jscodeshift` CLI options.

## Support table

|                                                                    | `asyncify` |
| ------------------------------------------------------------------ | ---------- |
| Converts `.then`                                                   | ✅         |
| Converts `.catch`                                                  | ✅         |
| Converts `.finally`                                                | ✅         |
| Renames identifiers in handlers that would conflict                | ✅         |
| Converts promise chains that aren't returned/awaited into IIAAFs   | ✅         |
| Converts `return Promise.resolve()`/`return Promise.reject()`      | ✅         |
| Removes unnecessary `Promise.resolve()` wrappers                   | ✅         |
| Warns when the original function could return/throw a non-promise  | Planned    |
| **Refactoring/inlining handlers that contain conditional returns** |            |
| All but one if/else/switch branch return                           | ✅         |
| All branches return, even nested ones                              | ✅         |
| All but one nested if/else/switch branch return                    | 🚫         |
| More than one if/else/switch branch doesn't return                 | 🚫         |
| Return inside loop                                                 | 🚫         |

## Warnings

Comments can sometimes get deleted due to an impedance mismatch between `@babel` and `recast`
ASTs. If you use the `--commentWorkarounds=true` option it will try to prevent more comments
from getting deleted but it sometimes causes an assertion to fail in `recast`.

There are a few edge cases where `asyncify` produces funky output. It's intended to not break
any existing behavior (I know of no cases where it does, and I have fixed several such issues)
but sometimes the output will be be semantically wrong even if it behaves
correctly. For example, I've seen a case where doing an async operation several times in a row:

```js
it('test', () => {
  const doSomething = () => {
    // ...
  }

  return doSomething()
    .then(doSomething)
    .then(doSomething)
}
```

Gets converted to:

```js
it('test', async () => {
  const doSomething = () => {
    // ...
  }
  await doSomething(await doSomething(await doSomething()))
})
```

This works even though it initially seems like it wouldn't and is obviously not what you want:

```js
it('test', async () => {
  const doSomething = () => {
    // ...
  }
  await doSomething()
  await doSomething()
  await doSomething()
})
```

Although I could possibly fix this for cases where it's easy to determine that the function has
no parameters, there could be cases where it's impossible to determine whether the identifier
`doSomething` is even a function or whether it has parameters.

## Disabling `recast` workaround

At the time I wrote `asyncify`, there were some show-stopping bugs in old version of `recast` that
`jscodeshift` depended on. To avoid this problem, `asyncify` parses with a newer version of `recast` in its
own dependencies, instead of parsing with the `jscodeshift` API. The author of `putout` has asked to be able
to parse with the injected `jscodeshift` API for performance, so you can access that version of the
`jscodeshift` transform as:

```js
import transform from '@codemodsquad/asyncify/noRecastWorkaround'
```

Or there are two ways you can do it when running via `jscodeshift`:

```
jscodeshift -t path/to/asyncify/noRecastWorkaround.js
jscodeshift -t path/to/asyncify/index.js --noRecastWorkaround=true
```
