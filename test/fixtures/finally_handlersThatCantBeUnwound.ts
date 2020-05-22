export const input = `
function foo() {
  return bar.finally(() => {
    switch (baz) {
      case 2: return
    }
    console.log('test')
  }).then(String)
}
function bar() {
  return a.finally(() => {
    for (const i of [1, 2, 3]) {
      return
    }
    console.log('test')
  }).then(String)
}
function qux() {
  return a.finally(() => {
    while (i) {
      return
    }
    console.log('test')
  }).then(String)
}
function baz() {
  return a.finally(() => {
    if (a) {
      if (b) {
        return
      }
    }
    console.log('test')
  }).then(String)
}
`

export const options = {}

export const expected = `
async function foo() {
  return bar.finally(async () => {
    switch (baz) {
      case 2: return
    }
    console.log('test')
  }).then(String)
}
async function bar() {
  return a.finally(async () => {
    for (const i of [1, 2, 3]) {
      return
    }
    console.log('test')
  }).then(String)
}
async function qux() {
  return a.finally(async () => {
    while (i) {
      return
    }
    console.log('test')
  }).then(String)
}
async function baz() {
  return a.finally(async () => {
    if (a) {
      if (b) {
        return
      }
    }
    console.log('test')
  }).then(String)
}
`
