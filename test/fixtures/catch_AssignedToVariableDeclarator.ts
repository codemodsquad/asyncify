export const input = `
async function foo() {
  const bar = await baz.catch(value => {
    if (value instanceof Blargh) return processBlargh(value)
    else return processOther(value)
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  let bar
  try {
    bar = await baz
  } catch (value) {
    if (value instanceof Blargh) bar = await processBlargh(value)
    else bar = await processOther(value)
  }
}
`
