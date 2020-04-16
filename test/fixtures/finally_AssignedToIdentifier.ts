export const input = `
async function foo() {
  let bar
  bar = await baz.finally(() => {
    if (condition) return processBlargh()
    else return processOther()
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  let bar
  try {
    bar = await baz
  } finally {
    if (condition) await processBlargh()
    else await processOther()
  }
}
`
