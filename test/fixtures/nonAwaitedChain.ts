export const input = `
function foo() {
  const bar = baz.then(x => x * 2)
}
`

export const options = {
  ignoreChainsShorterThan: 10,
}

export const expected = `
function foo() {
  const bar = (async () => {
    const x = await baz
    return x * 2
  })()
}
`
