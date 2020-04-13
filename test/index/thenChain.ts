export const input = `
function foo() {
  const bar = () => 3
  return bar().then(bar => {
    return bar()
  }).then(bar => {
    return bar()
  }).then(baz => {
    return baz * 2
  }).then(([{foo: baz = 5}]) => {
    return baz + 3
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  const bar = () => 3
  const bar1 = await bar()
  const bar0 = await bar1()
  const baz0 = await bar0()
  const [{ foo: baz = 5 }] = baz0 * 2
  return baz + 3
}
`
