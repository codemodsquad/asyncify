export const input = `
async function foo() {
  const {stuff} = await baz.finally(() => {
    if (condition) return processBlargh()
    return processOther()
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  let result
  try {
    result = await baz
  } finally {
    if (condition) await processBlargh()
    else await processOther()
  }
  const {stuff} = result
}
`
