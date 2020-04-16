export const input = `
async function foo() {
  await baz.finally(() => {
    if (condition) return processBlargh()
    else return processOther()
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  try {
    await baz
  } finally {
    if (condition) await processBlargh()
    else await processOther()
  }
}
`
