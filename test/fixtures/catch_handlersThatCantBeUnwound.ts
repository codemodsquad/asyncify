export const input = `
function foo() {
  return bar.catch(baz => {
    switch (baz) {
      case 2: return
    }
    console.log('test')
  }).then(String)
}
function bar() {
  return a.catch(b => {
    for (const i of [1, 2, 3]) {
      return
    }
    console.log('test')
  }).then(String)
}
function qux() {
  return a.catch(b => {
    while (i) {
      return
    }
    console.log('test')
  }).then(String)
}
function baz() {
  return a.catch(b => {
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
  return bar.catch(baz => {
    switch (baz) {
      case 2: return
    }
    console.log('test')
  }).then(String)
}
async function bar() {
  return a.catch(b => {
    for (const i of [1, 2, 3]) {
      return
    }
    console.log('test')
  }).then(String)
}
async function qux() {
  return a.catch(b => {
    while (i) {
      return
    }
    console.log('test')
  }).then(String)
}
async function baz() {
  return a.catch(b => {
    if (a) {
      if (b) {
        return
      }
    }
    console.log('test')
  }).then(String)
}
`
