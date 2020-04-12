export const input = `
async function foo() {
  await baz.then(
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
    if (value instanceof Blargh) await processBlargh(value)
    else await processOther(value)
  } catch (err) {
    if (err instanceof ConstraintViolation) await processConstraintViolation(err)
    else await processOther(err)
  }
}
`
