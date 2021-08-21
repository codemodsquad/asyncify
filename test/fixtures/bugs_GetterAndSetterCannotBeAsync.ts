export const input = `
class A {
  method() {return p.then(x => f(x))}
  get prop() {return p.then(x => f(x))}
  set prop(val) {return p.then(x => f(x))}
  get longchain() {return p.then(x => f(x)).then(y => g(y)).then(z => h(z))}
}
const obj = {
  method() {return p.then(x => f(x))},
  get prop() {return p.then(x => f(x))},
  set prop(val) {return p.then(x => f(x))}
};
`
export const expected = `
class A {
  async method() {
    const x = await p;
    return f(x);
  }
  get prop() {
    return p.then(x => f(x))
  }
  set prop(val) {
    return p.then(x => f(x))
  }
  get longchain() {
    return (async () => {
      const x = await p
      const y = await f(x)
      const z = await g(y)
      return await h(z)
    })()
  }
}
const obj = {
  async method() {
    const x = await p;
    return f(x);
  },
  get prop() {
    return p.then(x => f(x))
  },
  set prop(val) {
    return p.then(x => f(x))
  }
};
`
