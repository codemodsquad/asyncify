export const input = `
async function foo() {
  return process(await baz.then(
    value => {
      if (value instanceof Blargh) return processBlargh(value)
      else return processOther(value)
    },
    err => {
      if (err instanceof ConstraintViolation) return processConstraintViolation(err)
      else return processOther(err)
    }
  ))
}
`

export const options = {}

export const expected = `
async function foo() {
  let result
  try {
    const value = await baz
    if (value instanceof Blargh) result = await processBlargh(value)
    else result = await processOther(value)
  } catch (err) {
    if (err instanceof ConstraintViolation) result = await processConstraintViolation(err)
    else result = await processOther(err)
  }
  return process(result)
}
`
