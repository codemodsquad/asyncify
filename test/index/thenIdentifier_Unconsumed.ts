export const input = `
async function foo() {
  await baz.then(foo)
}
`

export const options = {}

export const expected = `
async function foo() {
  await foo(await baz)
}
`
