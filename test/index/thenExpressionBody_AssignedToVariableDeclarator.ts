export const input = `
async function foo() {
  const bar = await baz.then(value => process(value))
}
`

export const options = {}

export const expected = `
async function foo() {
  const value = await baz
  const bar = await process(value)
}
`
