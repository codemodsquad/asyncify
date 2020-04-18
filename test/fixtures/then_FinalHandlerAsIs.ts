export const input = `
function foo() {
  return baz.then(x => y).then(z => {
    for (const i = 0; i < 5; i++) {
      if (items[i] < z) return w;
    }
    switch (z) {
      case 0:
        return a;
      case 1:
        return b;
      case 2:
      case 3:
        return c;
    }
    console.log('test');
    return d;
  });
}
`

export const options = {}

export const expected = `
async function foo() {
  const x = await baz
  const z = await y
  for (const i = 0; i < 5; i++) {
    if (items[i] < z) return w;
  }
  switch (z) {
    case 0:
      return a;
    case 1:
      return b;
    case 2:
    case 3:
      return c;
  }
  console.log('test');
  return d;
}
`
