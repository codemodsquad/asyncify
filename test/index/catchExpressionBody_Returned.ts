export const input = `
function foo() {
  return baz.catch(handleError)
}
`

export const options = {}

export const expected = `
async function foo() {
  try {
    return baz
  } catch (err) {
    return handleError(err)
  }
}
`
