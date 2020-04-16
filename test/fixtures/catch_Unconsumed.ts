export const input = `
async function foo() {
  await baz.catch(value => {
    if (value instanceof Blargh) return processBlargh(value)
    else return processOther(value)
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  try {
    await baz
  } catch (value) {
    if (value instanceof Blargh) await processBlargh(value)
    else await processOther(value)
  }
}
`
