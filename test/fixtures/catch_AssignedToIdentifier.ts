export const input = `
async function foo() {
  let bar = 3
  bar = await baz.catch(value => {
    if (value instanceof Blargh) return processBlargh(value)
    else return processOther(value)
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  let bar = 3
  try {
    bar = await baz
  } catch (value) {
    if (value instanceof Blargh) bar = await processBlargh(value)
    else bar = await processOther(value)
  }
}
`
