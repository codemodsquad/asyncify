export const input = `
async function foo() {
  let bar = 3
  bar = await baz.then(value => process(value))
}
`

export const options = {}

export const expected = `
async function foo() {
  let bar = 3
  const value = await baz
  bar = await process(value)
}
`
