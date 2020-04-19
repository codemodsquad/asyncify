export const input = `
function foo() {
  return bar.then(baz => {
    if (qux) {
      return qux.then(() => baz)
    }
    return baz
  }).then(() => {
    console.log('done')
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
  console.log('done')
}
`
