export const input = `
function foo() {
  return Promise.reject(new Error('test'))
}
`

export const options = {}

export const expected = `
async function foo() {
  throw new Error('test')
}
`
