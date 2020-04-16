export const input = `
async function foo() {
  return await baz.finally(cleanup)
}
`

export const options = {}

export const expected = `
async function foo() {
  try {
    return await baz
  } finally {
    await cleanup()
  }
}
`
