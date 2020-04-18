export const input = `
function foo() {
  return bar.finally(() => {
    switch (baz) {
      case 2: return
    }
    console.log('test')
  })
}
function bar() {
  return a.finally(() => {
    for (const i of [1, 2, 3]) {
      return
    }
    console.log('test')
  })
}
function qux() {
  return a.finally(() => {
    while (i) {
      return
    }
    console.log('test')
  })
}
function baz() {
  return a.finally(() => {
    if (a) {
      if (b) {
        return
      }
    }
    console.log('test')
  })
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
  })
}
async function bar() {
  return a.finally(async () => {
    for (const i of [1, 2, 3]) {
      return
    }
    console.log('test')
  })
}
async function qux() {
  return a.finally(async () => {
    while (i) {
      return
    }
    console.log('test')
  })
}
async function baz() {
  return a.finally(async () => {
    if (a) {
      if (b) {
        return
      }
    }
    console.log('test')
  })
}
`
