export const input = `
function f1() {
  return bar.catch(baz => {
    switch (baz) {
      case 2: return
    }
  })
}
function f2() {
  return a.catch(b => {
    for (const i of [1, 2, 3]) {
      return
    }
  })
}
function f3() {
  return a.catch(b => {
    while (i) {
      return
    }
  })
}
function f4() {
  return a.catch(b => {
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
  try {
    return await bar
  } catch (baz) {
    switch (baz) {
      case 2:
        return
    }
  }
}
async function f2() {
  try {
    return await a
  } catch (b) {
    for (const i of [1, 2, 3]) {
      return
    }
  }
}
async function f3() {
  try {
    return await a
  } catch (b) {
    while (i) {
      return
    }
  }
}
async function f4() {
  try {
    return await a
  } catch (b) {
    if (a) {
      if (b) {
        return
      }
    }
  }
}
`
