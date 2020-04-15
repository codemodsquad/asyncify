export const input = `
function foo() {
  return bar.then(baz => {
    switch (baz) {
      case 2: return
    }
  })
}
function bar() {
  return a.then(b => {
    for (const i of [1, 2, 3]) {
      return
    }
  })
}
function qux() {
  return a.then(b => {
    while (i) {
      return
    }
  })
}
function baz() {
  return a.then(b => {
    if (a) {
      if (b) {
        return
      }
    }
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  return (async baz => {
    switch (baz) {
      case 2:
        return
    }
  })(await bar)
}
async function bar() {
  return (async b => {
    for (const i of [1, 2, 3]) {
      return
    }
  })(await a)
}
async function qux() {
  return (async b => {
    while (i) {
      return
    }
  })(await a)
}
async function baz() {
  return (async b => {
    if (a) {
      if (b) {
        return
      }
    }
  })(await a)
}
`
