export const input = `
function foo() {
  const bar = baz.then(x => x * 2)
}
`

export const options = {
  ignoreChainsShorterThan: 50,
}

export const expected = `
function foo() {
  const bar = baz.then(x => x * 2)
}
`
