export const input = `
let c
let d
function foo() {
  const a = 2
  const b = 3
  return bar().then(x => {
    const c = 4
    function d() {}
    d()
    for (const q of x) {
      var a = 5
      let b = 2
    }
    return a
  })
}
`

export const options = {}

export const expected = `
let c
let d
async function foo() {
  const a = 2
  const b = 3
  const x = await bar()
  const c_ASYNCIFY_0 = 4
  function d_ASYNCIFY_0() {}
  d_ASYNCIFY_0()
  for (const q of x) {
    var a_ASYNCIFY_0 = 5
    let b = 2
  }
  return await a_ASYNCIFY_0
}
`
