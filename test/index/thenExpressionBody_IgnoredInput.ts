export const input = `
function foo(value) {
  return baz.then(() => process(value))
}
`

export const options = {}

export const expected = `
async function foo(value) {
  await baz
  return process(value)
}
`
