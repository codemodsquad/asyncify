export const input = `
async function createUser(args) {
  const {username, groups} = args
  const user = await Users.create({username})
    .then(user => {
      if (groups) {
        console.log('a')
        return addUserToGroups(user, groups)
      } else if (foo) {
        console.log('b')
        return addUserToGroups(user, groups)
      } else if (bar) {
        console.log('c')
        return addUserToGroups(user, groups)
      }
      console.log('d')
      return user
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
    const user0 = await Users.create({ username })
    if (groups) {
      console.log('a')
      user = await addUserToGroups(user0, groups)
    } else if (foo) {
      console.log('b')
      user = await addUserToGroups(user0, groups)
    } else if (bar) {
      console.log('c')
      user = await addUserToGroups(user0, groups)
    } else {
      console.log('d')
      user = await user0
    }
  } catch (err) {
    console.error(err.stack)
    user = await dummyUser()
  }
}
`
