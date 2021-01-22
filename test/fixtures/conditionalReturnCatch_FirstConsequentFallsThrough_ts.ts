export const input = `
async function createUser(args) {
  const {username, groups} = args
  const user = await Users.create({username})
    .then((user: User) => {
      if (groups) {
        console.log('a')
      } else if (foo) {
        console.log('b')
        return addUserToGroups(user, groups).then(() => user)
      } else {
        console.log('c')
        return addUserToGroups(user, groups).then(() => user)
      }
      return user
    })
    .catch((err: Error) => {
      console.error(err.stack)
      return dummyUser()
    })
}
`

export const options = {}
export const parser = 'ts'

export const expected = `
async function createUser(args) {
  const {username, groups} = args
  let user
  try {
    const user0: User = await Users.create({ username })
    if (groups) {
      console.log('a')
      user = user0
    } else if (foo) {
      console.log('b')
      await addUserToGroups(user0, groups)
      user = user0
    } else {
      console.log('c')
      await addUserToGroups(user0, groups)
      user = user0
    }
  } catch (err) {
    console.error(err.stack)
    user = await dummyUser()
  }
}
`
