export const input = `
async function foo() {
  return process(await baz.then(value => {
    if (value instanceof Blargh) return processBlargh(value)
    else return processOther(value)
  }))
}
`

export const options = {}

export const expected = `
async function foo() {
  let result
  const value = await baz
  if (value instanceof Blargh) result = await processBlargh(value)
  else result = await processOther(value)
  return process(result)
}
`
