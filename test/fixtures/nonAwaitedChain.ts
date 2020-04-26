export const input = `
function foo() {
  const bar = baz.then(x => x * 2).catch(err => {
    console.error(err.stack)
    return 2
  })
}
`

export const options = {}

export const expected = `
function foo() {
  const bar = (async () => {
    try {
      const x = await baz
      return x * 2
    } catch (err) {
      console.error(err.stack)
      return 2
    }
  })()
}
`
