export const input = `
function foo() {
  return Promise.resolve(2)
}
function bar() {
  return Promise.resolve()
}
function baz() {
  if (qux) {
    return Promise.resolve()
  }
  return Promise.resolve(3)
}
`

export const options = {}

export const expected = `
async function foo() {
  return 2
}
async function bar() {
}
async function baz() {
  if (qux) {
    return
  }
  return 3
}
`
