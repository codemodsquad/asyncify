export const input = `
function foo(err) {
  return baz.catch(() => err.message)
}
`

export const options = {}

export const expected = `
async function foo(err) {
  try {
    return await baz
  } catch (err0) {
    return err.message
  }
}
`
