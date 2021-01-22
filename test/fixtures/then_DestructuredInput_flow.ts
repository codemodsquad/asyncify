export const input = `
function foo() {
  return baz.then(({value}: {value: string}) => {
    if (value instanceof Blargh) return processBlargh(value)
    else return processOther(value)
  })
}
`

export const options = {}
export const parser = 'babylon'

export const expected = `
async function foo() {
  const {value}: {value: string} = await baz
  if (value instanceof Blargh) return processBlargh(value)
  else return processOther(value)
}
`
