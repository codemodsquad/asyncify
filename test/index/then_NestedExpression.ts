export const input = `
async function foo() {
  return process(await baz.then(value => {
    if (value instanceof Blargh) return processBlargh(value)
    return processOther(value)
  }))
}
`

export const options = {}

export const expected = `
async function foo() {
  const value = await baz
  let result
  if (value instanceof Blargh) result = await processBlargh(value)
  else result = await processOther(value)
  return await process(result)
}
`
