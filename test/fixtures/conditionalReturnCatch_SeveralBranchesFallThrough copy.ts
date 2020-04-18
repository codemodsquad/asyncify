export const input = `
async function createUser(args) {
  const {username, groups} = args
  const user = await Users.create({username})
    .then(user => {
      if (groups) {
        return addUserToGroups(user, groups)
      } else if (foo) {
        console.log('test')
      } else if (bar) {
        console.log('test2')
      }
      console.log('blah')
      return user
    })
    .then(user => {
      if (groups) {
        console.log('test')
      } else {
        return 'noGroups'
      }
      return 'user'
    })
    .catch(err => {
      console.error(err.stack)
      return dummyUser()
    })
}
`

export const options = {}

export const expected = `
async function createUser(args) {
  const {username, groups} = args
  let user
  try {
    const user0 = await Users.create({ username }).then(async user => {
      if (groups) {
        return addUserToGroups(user, groups)
      } else if (foo) {
        console.log('test')
      } else if (bar) {
        console.log('test2')
      }
      console.log('blah')
      return user
    })
    if (groups) {
      console.log('test')
      user = 'user'
    } else {
      user = 'noGroups'
    }
  } catch (err) {
    console.error(err.stack)
    user = await dummyUser()
  }
}
`
