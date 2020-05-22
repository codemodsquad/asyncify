export const input = `
const handleError = () => {}
function foo() {
  return baz.catch(handleError)
}
`

export const options = {}

export const expected = `
const handleError = () => {}
async function foo() {
  try {
    return await baz
  } catch (err) {
    return handleError(err)
  }
}
`
