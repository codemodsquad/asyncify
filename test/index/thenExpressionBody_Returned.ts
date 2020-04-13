export const input = `
function foo() {
  return baz.then(value => process(value))
}
`

export const options = {}

export const expected = `
async function foo() {
  const value = await baz
  return await process(value)
}
`
