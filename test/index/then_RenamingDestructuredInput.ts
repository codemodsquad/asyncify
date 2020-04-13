export const input = `
function foo() {
  const value = 3
  return baz.then(({value}) => {
    if (value instanceof Blargh) return processBlargh(value)
    else return processOther(value)
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  const value = 3
  const {value: value0} = await baz
  if (value0 instanceof Blargh) return await processBlargh(value0)
  else return await processOther(value0)
}
`
