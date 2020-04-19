export const input = `
async function createUser(args) {
  const {username, groups} = args
  const user = await Users.create({username})
    .then(user => {
      if (groups) {
        console.log('a')
      } else if (foo) {
        console.log('b')
        return addUserToGroups(user, groups)
      } else if (bar) {
        console.log('c')
        return addUserToGroups(user, groups)
      }
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
    user = await Users.create({ username }).then(async user => {
      if (groups) {
        console.log('a')
      } else if (foo) {
        console.log('b')
        return addUserToGroups(user, groups)
      } else if (bar) {
        console.log('c')
        return addUserToGroups(user, groups)
      }
      return user
    })
  } catch (err) {
    console.error(err.stack)
    user = await dummyUser()
  }
}
`
