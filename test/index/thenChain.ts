export const input = `
function foo() {
  const bar = () => 3
  return bar().then(bar => {
    return bar()
  }).then(baz => {
    return baz * 2
  }).then(baz => {
    return baz + 3
  })
}
`

export const options = {}

export const expected = `
async function foo() {
  const bar = () => 3
  const bar_asyncify_1 = await bar()
  const baz = await bar_asyncify_1()
  const baz_asyncify_2 = baz * 2
  return baz_asyncify_2 + 3
}
`
