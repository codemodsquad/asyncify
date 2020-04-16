export const input = `
function foo() {
  return baz.then(foo)
}
`

export const options = {}

export const expected = `
async function foo() {
  return foo(await baz)
}
`
