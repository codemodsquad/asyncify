export const input = `
async function foo() {
  return await baz.finally(() => {
    if (condition) return processBlargh()
    return processOther()
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  try {
    return await baz
  } finally {
    if (condition) await processBlargh()
    else await processOther()
  }
}
`
