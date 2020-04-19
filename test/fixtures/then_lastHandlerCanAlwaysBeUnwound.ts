export const input = `
function foo() {
  return bar.then(baz => {
    switch (baz) {
      case 2: return
    }
    console.log('test')
  })
}
function bar() {
  return a.then(b => {
    for (const i of [1, 2, 3]) {
      return
    }
    console.log('test')
  })
}
function qux() {
  return a.then(b => {
    while (i) {
      return
    }
    console.log('test')
  })
}
function baz() {
  return a.then(b => {
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
  const baz0 = await bar
  switch (baz0) {
    case 2: return
  }
  console.log('test')
}
async function bar() {
  const b = await a
  for (const i of [1, 2, 3]) {
    return
  }
  console.log('test')
}
async function qux() {
  const b = await a
  while (i) {
    return
  }
  console.log('test')
}
async function baz() {
  const b = await a
  if (a) {
    if (b) {
      return
    }
  }
  console.log('test')
}
`
