export const input = `
async function f1() {
  const x = await bar.then(baz => {
    switch (baz) {
      case 2: return 2
    }
  })
}
async function f2() {
  const x = await a.then(b => {
    for (const i of [1, 2, 3]) {
      return 2
    }
  })
}
async function f3() {
  const x = await a.then(b => {
    while (i) {
      return 2
    }
  })
}
async function f4() {
  const x = await a.then(b => {
    if (a) {
      if (b) {
        return 2
      }
    }
  })
}
`

export const options = {}

export const expected = `
async function f1() {
  let x
  const baz = await bar
  switch (baz) {
    case 2: {
      x = 2
      break
    }
  }
}
async function f2() {
  let x
  const b = await a
  for (const i of [1, 2, 3]) {
    x = 2
    break
  }
}
async function f3() {
  let x
  const b = await a
  while (i) {
    x = 2
    break
  }
}
async function f4() {
  let x
  const b = await a
  if (a) {
    if (b) {
      x = 2
    }
  }
}
`
