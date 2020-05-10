export const input = `
function foo() {
  // this is a test
  return bar.then(baz => {
    return process(baz)
  }).then(results => {
    console.log(results)
  })
}
`

export const options = {
  commentWorkarounds: true,
}

export const expected = `
async function foo() {
  // this is a test
  const baz = await bar
  const results = await process(baz)
  console.log(results)
}
`
