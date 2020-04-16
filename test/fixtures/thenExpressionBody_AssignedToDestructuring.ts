export const input = `
async function foo() {
  const {stuff} = await baz.then(value => process(value))
}
`

export const options = {}

export const expected = `
async function foo() {
  const value = await baz
  const {stuff} = await process(value)
}
`
