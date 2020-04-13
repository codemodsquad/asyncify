export const input = `
function foo() {
  return baz.then(({value}) => {
    value = value || dummy()
    if (value instanceof Blargh) return processBlargh(value)
    else return processOther(value)
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  let {value} = await baz
  value = value || dummy() 
  if (value instanceof Blargh) return await processBlargh(value)
  else return await processOther(value)
}
`
