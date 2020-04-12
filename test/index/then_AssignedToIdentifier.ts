export const input = `
async function foo() {
  let bar = 3
  bar = await baz.then(value => {
    if (value instanceof Blargh) return processBlargh(value)
    return processOther(value)
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  let bar = 3
  const value = await baz
  if (value instanceof Blargh) bar = await processBlargh(value)
  else bar = await processOther(value)
}
`
