export const input = `
async function foo() {
  await baz.then(value => process(value))
}
`

export const options = {}

export const expected = `
async function foo() {
  const value = await baz
  await process(value)
}
`
