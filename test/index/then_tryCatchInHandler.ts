export const input = `
function foo() {
  return bar.then(() => {
    try {
      // this must not get awaited, because that would change the behavior
      return blah
    } catch (err) {
      return glab
    }
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  await bar
  try {
    // this must not get awaited, because that would change the behavior
    return blah
  } catch (err) {
    return glab
  }
}
`
