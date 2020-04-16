export const input = `
function foo() {
  return bar.then(baz => {
    baz = 3
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  let baz = await bar
  baz = 3
}
`
