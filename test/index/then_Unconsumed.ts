export const input = `
async function foo() {
  await baz.then(value => {
    if (value instanceof Blargh) return processBlargh(value)
    return processOther(value)
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  const value = await baz
  if (value instanceof Blargh) await processBlargh(value)
  else await processOther(value)
}
`
