export const input = `
function foo() {
  return baz.then(value => {
    function processBlargh(value) {
      return JSON.stringify(value)
    }
    if (value instanceof Blargh) return processBlargh(value)
    else return processOther(value)
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  const value = await baz
  function processBlargh(value) {
    return JSON.stringify(value)
  }
  if (value instanceof Blargh) return await processBlargh(value)
  else return await processOther(value)
}
`
