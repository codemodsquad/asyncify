export const input = `
async function foo() {
  const handler = 2
  await baz.then(makeHandler(5))
}
`

export const options = {}

export const expected = `
async function foo() {
  const handler = 2
  await baz.then(makeHandler(5))
}
`
