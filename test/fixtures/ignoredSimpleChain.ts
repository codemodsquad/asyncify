export const input = `
function foo() {
  const bar = baz.then(x => x * 2).catch(err => {
    console.error(err.stack)
  })
}
`

export const options = {}

export const expected = input
