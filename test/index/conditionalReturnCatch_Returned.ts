export const input = `
function createUser(args) {
  const {username, groups} = args
  return Users.create({username})
    .then(user => {
      if (groups) {
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
  try {
    const user = await Users.create({
      username
    })
    if (groups) {
      return addUserToGroups(user, groups)
    } else {
      return user
    }
  } catch (err) {
    console.error(err.stack)
    return dummyUser()
  }
}
`
