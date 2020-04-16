export const input = `
function f1() {
  return bar.finally(() => {
    switch (baz) {
      case 2: return
    }
  })
}
function f2() {
  return a.finally(() => {
    for (const i of [1, 2, 3]) {
      return
    }
  })
}
function f3() {
  return a.finally(() => {
    while (i) {
      return
    }
  })
}
function f4() {
  return a.finally(() => {
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
  } finally {
    switch (baz) {
      case 2:
        break
    }
  }
}
async function f2() {
  try {
    return await a
  } finally {
    for (const i of [1, 2, 3]) {
      break
    }
  }
}
async function f3() {
  try {
    return await a
  } finally {
    while (i) {
      break
    }
  }
}
async function f4() {
  try {
    return await a
  } finally {
    if (a) {
      if (b) {
        
      }
    }
  }
}
`
