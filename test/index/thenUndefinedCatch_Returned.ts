export const input = `
function foo() {
  return baz.then(
    undefined,
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
    return baz
  } catch (err) {
    if (err instanceof ConstraintViolation) return processConstraintViolation(err)
    else return processOther(err)
  }
}
`
