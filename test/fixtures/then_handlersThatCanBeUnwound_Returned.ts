export const input = `
function f1() {
  return bar.then(baz => {
    switch (baz) {
      case 2: return
    }
  })
}
function f2() {
  return a.then(b => {
    for (const i of [1, 2, 3]) {
      return
    }
  })
}
function f3() {
  return a.then(b => {
    while (i) {
      return
    }
  })
}
function f4() {
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
async function f1() {
  const baz = await bar
  switch (baz) {
    case 2:
      return
  }
}
async function f2() {
  const b = await a
  for (const i of [1, 2, 3]) {
    return
  }
}
async function f3() {
  const b = await a
  while (i) {
    return
  }
}
async function f4() {
  const b = await a
  if (a) {
    if (b) {
      return
    }
  }
}
`
