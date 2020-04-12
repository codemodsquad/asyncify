export const input = `
async function foo() {
  return process(await baz.finally(() => {
    if (condition) return processBlargh()
    return processOther()
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
    if (condition) result = await processBlargh()
    else result = await processOther()
  }
  return await process(result)
}
`
