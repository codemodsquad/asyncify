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
  const user = await Users.create({username})
  let returnValue
  try {
    if (groups) {
      returnValue = await addUserToGroups(user, groups)
    } else {
      returnValue = user
    }
  } catch (err) {
    console.error(err.stack)
    returnValue = dummyUser()
  }
  return returnValue
}
`
