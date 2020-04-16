export const input = `
async function foo() {
  return process(await baz.finally(() => {
    if (condition) return processBlargh()
    else return processOther()
  }))
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
  return process(result)
}
`
