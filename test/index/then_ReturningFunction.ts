export const input = `
function foo() {
  return baz.then(value => {
    if (value instanceof Blargh) return () => JSON.stringify(value)
    else return () => String(value)
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  const value = await baz
  if (value instanceof Blargh) return () => JSON.stringify(value)
  else return () => String(value)
}
`
