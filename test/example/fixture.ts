export const input = `
function foo() {}
/* selectionStart */
function bar() {}
function baz() {}
/* selectionEnd */
function qux() {}
`

export const expected = `
function foo() {}
console.log('hello world')
function bar() {}
console.log('hello world')
function baz() {}
function qux() {}
`
