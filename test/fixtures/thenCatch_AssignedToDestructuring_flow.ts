export const input = `
async function foo() {
  const {stuff} = await baz.then(
    (value: Thing) => {
      if (value instanceof Blargh) return processBlargh(value)
      else return processOther(value)
    },
    (err: Error) => {
      if (err instanceof ConstraintViolation) return processConstraintViolation(err)
      else return processOther(err)
    }
  )
}
`

export const options = {}
export const parser = 'babylon'

export const expected = `
async function foo() {
  let result
  try {
    const value: Thing = await baz
    if (value instanceof Blargh) result = await processBlargh(value)
    else result = await processOther(value)
  } catch (err) {
    if (err instanceof ConstraintViolation) result = await processConstraintViolation(err)
    else result = await processOther(err)
  }
  const {stuff} = result
}
`
