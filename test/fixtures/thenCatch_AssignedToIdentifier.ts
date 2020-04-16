export const input = `
async function foo() {
  let bar = 3
  bar = await baz.then(
    value => {
      if (value instanceof Blargh) return processBlargh(value)
      else return processOther(value)
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
  let bar = 3
  try {
    const value = await baz
    if (value instanceof Blargh) bar = await processBlargh(value)
    else bar = await processOther(value)
  } catch (err) {
    if (err instanceof ConstraintViolation) bar = await processConstraintViolation(err)
    else bar = await processOther(err)
  }
}
`
