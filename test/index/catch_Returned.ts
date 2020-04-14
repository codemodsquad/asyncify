export const input = `
function foo() {
  return baz.catch(value => {
    if (value instanceof Blargh) return processBlargh(value)
    else return processOther(value)
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  try {
    return baz
  } catch (value) {
    if (value instanceof Blargh) return processBlargh(value)
    else return processOther(value)
  }
}
`
