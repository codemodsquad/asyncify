export const input = `
function createUser(args) {
  const {username, organizationId} = args
  return Users.create({username})
    .then(user => {
      return addUserToOrganization(user, organizationId)
    })
    .catch(err => {
      console.error(err.stack)
      return failedUser()
    })
    .finally(() => {
      return cleanup()
    })
}
`

export const options = {}

export const expected = `
async function createUser(args) {
  const {username, organizationId} = args
  try {
    const user = await Users.create({
      username,
    })
    return addUserToOrganization(user, organizationId)
  }
  catch (err) {
    console.error(err.stack)
    return failedUser()
  }
  finally {
    await cleanup()
  }
}
`
