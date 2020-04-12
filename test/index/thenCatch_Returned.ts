export const input = `
function foo() {
  return baz.then(
    value => {
      if (value instanceof Blargh) return processBlargh(value)
      return processOther(value)
    },
    err => {
      if (err instanceof ConstraintViolation) return processConstraintViolation(err)
      else return processOther(err)
    }
  )
}
`

export const options = {}

export const expected = `
async function foo() {
  try {
    const value = await baz
    if (value instanceof Blargh) return await processBlargh(value)
    else return await processOther(value)
  } catch (err) {
    if (err instanceof ConstraintViolation) return await processConstraintViolation(err)
    else return await processOther(err)
  }
}
`
