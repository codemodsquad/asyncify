export const input = `
async function foo() {
  const bar = await baz.then(foo)
}
`

export const options = {}

export const expected = `
async function foo() {
  const bar = await foo(await baz)
}
`
