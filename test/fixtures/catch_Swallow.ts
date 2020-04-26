export const input = `
function foo() {
  return baz.catch(() => {})
}
`

export const options = {}

export const expected = `
async function foo() {
  return baz.catch(() => {})
}
`
