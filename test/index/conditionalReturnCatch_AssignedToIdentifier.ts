export const input = `
async function createUser(args) {
  const {username, groups} = args
  const user = await Users.create({username})
    .then(user => {
      if (groups) {
        return addUserToGroups(user, groups)
      } else if (foo) {
        console.log('test')
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
    let user0
    const user1 = await Users.create({
      username
    })
    if (groups) {
      user0 = await addUserToGroups(user1, groups)
    } else if (foo) {
      console.log('test')
    } else {
      console.log('blah')
      user0 = await user1
    }
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
