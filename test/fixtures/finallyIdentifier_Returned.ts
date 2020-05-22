export const input = `
function cleanup() {
}
async function foo() {
  return await baz.finally(cleanup)
}
`

export const options = {}

export const expected = `
function cleanup() {
}
async function foo() {
  try {
    return await baz
  } finally {
    await cleanup()
  }
}
`
