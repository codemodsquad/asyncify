export const input = `
function foo() {
  return bar.catch(baz => {
    switch (baz) {
      case 2: return
    }
    console.log('test')
  })
}
function bar() {
  return a.catch(b => {
    for (const i of [1, 2, 3]) {
      return
    }
    console.log('test')
  })
}
function qux() {
  return a.catch(b => {
    while (i) {
      return
    }
    console.log('test')
  })
}
function baz() {
  return a.catch(b => {
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
  try {
    return await bar
  } catch(baz0) {
    switch (baz0) {
      case 2: return
    }
    console.log('test')
  }
}
async function bar() {
  try {
    return await a
  } catch(b) {
    for (const i of [1, 2, 3]) {
      return
    }
    console.log('test')
  }
}
async function qux() {
  try {
    return await a
  } catch (b) {
    while (i) {
      return
    }
    console.log('test')
  }
}
async function baz() {
  try {
    return await a
  } catch (b) {
    if (a) {
      if (b) {
        return
      }
    }
    console.log('test')
  }
}
`
