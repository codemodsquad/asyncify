export const input = `
async function foo() {
  await bar.then(baz => {
    if (qux) {
      return qux.then(() => baz)
    }
    return baz
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  const baz = await bar
  if (qux) {
    await qux
  }
}
`
